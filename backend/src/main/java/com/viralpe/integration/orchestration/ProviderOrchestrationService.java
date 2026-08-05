package com.viralpe.integration.orchestration;

import com.viralpe.integration.adapter.*;
import com.viralpe.integration.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ProviderOrchestrationService {

    private static final Logger log = LoggerFactory.getLogger(ProviderOrchestrationService.class);

    private final Map<String, ProviderAdapter> adapterMap = new ConcurrentHashMap<>();
    private final Map<String, ProviderConfigDTO> configMap = new ConcurrentHashMap<>();
    private final Map<String, Integer> failureCounter = new ConcurrentHashMap<>();
    private final IdempotencyService idempotencyService;

    public ProviderOrchestrationService(List<ProviderAdapter> adapters, IdempotencyService idempotencyService) {
        this.idempotencyService = idempotencyService;
        for (ProviderAdapter adapter : adapters) {
            adapterMap.put(adapter.getProviderId().toUpperCase(), adapter);
        }
        initDefaultConfigs();
    }

    private void initDefaultConfigs() {
        // Kwik Provider (Primary Priority 1)
        configMap.put("KWIK", new ProviderConfigDTO(
                "KWIK", "Kwik Payment Solutions", true, 1,
                List.of("RECHARGE", "UTILITY", "VOUCHER"), "HEALTHY", 99.4, 4.5, 5000
        ));

        // Goterr Provider (Backup Priority 2)
        configMap.put("GOTER", new ProviderConfigDTO(
                "GOTER", "Goterr Gateway Services", true, 2,
                List.of("RECHARGE", "UTILITY"), "HEALTHY", 98.2, 3.8, 6000
        ));
    }

    public List<ProviderConfigDTO> getAllProviderConfigs() {
        return new ArrayList<>(configMap.values());
    }

    public ProviderConfigDTO updateProviderConfig(String providerId, boolean enabled, Integer priority, Double margin) {
        String key = providerId != null ? providerId.toUpperCase() : "";
        ProviderConfigDTO cfg = configMap.get(key);
        if (cfg != null) {
            cfg.setEnabled(enabled);
            if (priority != null) cfg.setPriority(priority);
            if (margin != null) cfg.setOfferMarginPercentage(margin);
            log.info("Updated provider config for {}: enabled={}, priority={}", key, enabled, priority);
        }
        return cfg;
    }

    public ProviderExecuteResponseDTO executeOrchestratedPayment(ProviderExecuteRequestDTO request) {
        String idempotencyKey = request != null ? request.getIdempotencyKey() : null;
        if (idempotencyService.isProcessed(idempotencyKey)) {
            log.info("Idempotent request detected for key: {}", idempotencyKey);
            return idempotencyService.getExistingResponse(idempotencyKey);
        }

        String correlationId = (request != null && request.getRequestCorrelationId() != null)
                ? request.getRequestCorrelationId()
                : "REQ-" + UUID.randomUUID().toString().substring(0, 8);

        String category = (request != null && request.getServiceType() != null)
                ? request.getServiceType().toUpperCase()
                : "RECHARGE";

        // Select active candidate adapters sorted by priority
        List<ProviderConfigDTO> candidates = configMap.values().stream()
                .filter(ProviderConfigDTO::isEnabled)
                .filter(c -> !"DOWN".equalsIgnoreCase(c.getHealthStatus()))
                .filter(c -> c.getSupportedCategories() != null && c.getSupportedCategories().contains(category))
                .sorted(Comparator.comparingInt(ProviderConfigDTO::getPriority))
                .collect(Collectors.toList());

        List<String> attemptedProviders = new ArrayList<>();
        boolean failoverOccurred = false;

        for (int i = 0; i < candidates.size(); i++) {
            ProviderConfigDTO config = candidates.get(i);
            String pid = config.getProviderId();
            ProviderAdapter adapter = adapterMap.get(pid);

            if (adapter == null) continue;

            attemptedProviders.add(pid);
            if (i > 0) {
                failoverOccurred = true;
                log.warn("Failover triggered! Attempting execution via secondary provider: {}", pid);
            }

            try {
                ProviderPaymentRequest pReq = new ProviderPaymentRequest(
                        correlationId,
                        idempotencyKey,
                        category,
                        request.getBillerOrOperatorCode(),
                        request.getAccountNumberOrMobile(),
                        request.getAmount()
                );

                ProviderPaymentResponse pRes = adapter.executePayment(pReq);

                if (pRes != null && pRes.isSuccess()) {
                    // Reset failure counter on success
                    failureCounter.put(pid, 0);
                    config.setHealthStatus("HEALTHY");

                    ProviderExecuteResponseDTO response = new ProviderExecuteResponseDTO();
                    response.setStatus("SUCCESS");
                    response.setTransactionId("TXN-" + System.currentTimeMillis());
                    response.setAssignedProviderId(pid);
                    response.setProviderReferenceId(pRes.getProviderRefNumber());
                    response.setRequestCorrelationId(correlationId);
                    response.setAmountPaid(request.getAmount());
                    response.setFailoverOccurred(failoverOccurred);
                    response.setAttemptedProviders(attemptedProviders);
                    response.setTimestamp(Instant.now().toString());

                    idempotencyService.recordResponse(idempotencyKey, response);
                    return response;
                } else {
                    recordFailure(pid, config);
                }
            } catch (Exception ex) {
                log.error("Error executing payment via provider {}: {}", pid, ex.getMessage());
                recordFailure(pid, config);
            }
        }

        // All providers failed
        ProviderExecuteResponseDTO failResponse = new ProviderExecuteResponseDTO();
        failResponse.setStatus("FAILED");
        failResponse.setTransactionId("TXN-FAIL-" + System.currentTimeMillis());
        failResponse.setRequestCorrelationId(correlationId);
        failResponse.setFailoverOccurred(failoverOccurred);
        failResponse.setAttemptedProviders(attemptedProviders);
        failResponse.setNormalizedErrorCode("ALL_PROVIDERS_FAILED");
        failResponse.setErrorMessage("All orchestrated payment providers failed or were unavailable.");
        failResponse.setTimestamp(Instant.now().toString());

        idempotencyService.recordResponse(idempotencyKey, failResponse);
        return failResponse;
    }

    private void recordFailure(String providerId, ProviderConfigDTO config) {
        int count = failureCounter.getOrDefault(providerId, 0) + 1;
        failureCounter.put(providerId, count);
        if (count >= 3) {
            config.setHealthStatus("DEGRADED");
            log.warn("Provider {} health state changed to DEGRADED due to {} consecutive failures", providerId, count);
        }
        if (count >= 5) {
            config.setHealthStatus("DOWN");
            log.error("Circuit breaker tripped! Provider {} marked DOWN", providerId);
        }
    }
}
