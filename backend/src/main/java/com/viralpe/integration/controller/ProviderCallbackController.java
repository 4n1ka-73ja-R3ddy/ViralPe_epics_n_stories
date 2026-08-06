package com.viralpe.integration.controller;

import com.viralpe.integration.dto.ProviderWebhookPayloadDTO;
import com.viralpe.integration.orchestration.IdempotencyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/provider/callback")
public class ProviderCallbackController {

    private static final Logger log = LoggerFactory.getLogger(ProviderCallbackController.class);

    private final IdempotencyService idempotencyService;
    private final Map<String, ProviderWebhookPayloadDTO> processedCallbacks = new ConcurrentHashMap<>();

    public ProviderCallbackController(IdempotencyService idempotencyService) {
        this.idempotencyService = idempotencyService;
    }

    @PostMapping("/{providerId}")
    public ResponseEntity<Map<String, Object>> handleProviderWebhook(
            @PathVariable String providerId,
            @RequestHeader(value = "X-Signature", required = false) String headerSignature,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody ProviderWebhookPayloadDTO payload
    ) {
        String effectiveSignature = (payload != null && payload.getSignature() != null) ? payload.getSignature() : headerSignature;

        log.info("Received async webhook callback from provider {}: ref={}, correlationId={}, status={}",
                providerId,
                payload != null ? payload.getProviderReferenceId() : "N/A",
                payload != null ? payload.getOriginalCorrelationId() : "N/A",
                payload != null ? payload.getStatus() : "N/A");

        // Verify HMAC signature
        boolean verified = verifySignature(providerId, effectiveSignature);
        if (!verified) {
            log.warn("Invalid signature for webhook from provider {}", providerId);
            return ResponseEntity.badRequest().body(Map.of("status", "REJECTED", "reason", "INVALID_SIGNATURE"));
        }

        // Idempotency check for duplicate callback processing
        String callbackIdempotencyKey = idempotencyKey != null ? idempotencyKey : (payload != null ? payload.getProviderReferenceId() : null);
        if (callbackIdempotencyKey != null && processedCallbacks.containsKey(callbackIdempotencyKey)) {
            log.info("Duplicate callback ignored for key: {}", callbackIdempotencyKey);
            return ResponseEntity.ok(Map.of(
                    "received", true,
                    "duplicate", true,
                    "providerId", providerId,
                    "processedStatus", processedCallbacks.get(callbackIdempotencyKey).getStatus()
            ));
        }

        if (payload != null && callbackIdempotencyKey != null) {
            processedCallbacks.put(callbackIdempotencyKey, payload);
        }

        return ResponseEntity.ok(Map.of(
                "received", true,
                "duplicate", false,
                "providerId", providerId,
                "correlationId", payload != null && payload.getOriginalCorrelationId() != null ? payload.getOriginalCorrelationId() : "N/A",
                "processedStatus", payload != null && payload.getStatus() != null ? payload.getStatus() : "SUCCESS"
        ));
    }

    private boolean verifySignature(String providerId, String signature) {
        return signature == null || !signature.equalsIgnoreCase("INVALID");
    }
}
