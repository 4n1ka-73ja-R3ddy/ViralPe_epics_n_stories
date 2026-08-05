package com.viralpe.integration.orchestration;

import com.viralpe.integration.dto.ProviderExecuteResponseDTO;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdempotencyService {

    private final Map<String, ProviderExecuteResponseDTO> processedRequests = new ConcurrentHashMap<>();

    public boolean isProcessed(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            return false;
        }
        return processedRequests.containsKey(idempotencyKey.trim());
    }

    public ProviderExecuteResponseDTO getExistingResponse(String idempotencyKey) {
        if (idempotencyKey == null) return null;
        return processedRequests.get(idempotencyKey.trim());
    }

    public void recordResponse(String idempotencyKey, ProviderExecuteResponseDTO response) {
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty() && response != null) {
            processedRequests.put(idempotencyKey.trim(), response);
        }
    }
}
