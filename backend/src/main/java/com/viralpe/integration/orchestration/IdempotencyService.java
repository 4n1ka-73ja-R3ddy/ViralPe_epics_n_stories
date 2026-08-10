package com.viralpe.integration.orchestration;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdempotencyService {

    private final Map<String, Object> processedRequests = new ConcurrentHashMap<>();
    private final Map<String, Long> processedTimestamps = new ConcurrentHashMap<>();

    public boolean isProcessed(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            return false;
        }
        return processedRequests.containsKey(idempotencyKey.trim());
    }

    @SuppressWarnings("unchecked")
    public <T> T getExistingResponse(String idempotencyKey, Class<T> responseType) {
        if (idempotencyKey == null) return null;
        Object response = processedRequests.get(idempotencyKey.trim());
        if (response != null && responseType.isInstance(response)) {
            return (T) response;
        }
        return null;
    }

    public Object getExistingResponse(String idempotencyKey) {
        if (idempotencyKey == null) return null;
        return processedRequests.get(idempotencyKey.trim());
    }

    public void recordResponse(String idempotencyKey, Object response) {
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty() && response != null) {
            String key = idempotencyKey.trim();
            processedRequests.put(key, response);
            processedTimestamps.put(key, System.currentTimeMillis());
        }
    }

    public boolean isCallbackReplayed(String callbackSignatureOrKey) {
        return isProcessed("CB:" + callbackSignatureOrKey);
    }

    public void recordCallbackReplay(String callbackSignatureOrKey, Object resultPayload) {
        recordResponse("CB:" + callbackSignatureOrKey, resultPayload);
    }
}
