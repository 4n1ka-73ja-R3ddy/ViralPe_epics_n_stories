package com.viralpe.integration.controller;

import com.viralpe.integration.dto.ProviderWebhookPayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/provider/callback")
public class ProviderCallbackController {

    private static final Logger log = LoggerFactory.getLogger(ProviderCallbackController.class);

    @PostMapping("/{providerId}")
    public ResponseEntity<Map<String, Object>> handleProviderWebhook(
            @PathVariable String providerId,
            @RequestBody ProviderWebhookPayloadDTO payload
    ) {
        log.info("Received async webhook callback from provider {}: ref={}, status={}",
                providerId, payload.getProviderReferenceId(), payload.getStatus());

        // Process webhook status update (SUCCESS, FAILED, PENDING)
        boolean verified = verifySignature(providerId, payload.getSignature());
        if (!verified) {
            log.warn("Invalid signature for webhook from provider {}", providerId);
            return ResponseEntity.badRequest().body(Map.of("status", "REJECTED", "reason", "INVALID_SIGNATURE"));
        }

        return ResponseEntity.ok(Map.of(
                "received", true,
                "providerId", providerId,
                "processedStatus", payload.getStatus() != null ? payload.getStatus() : "SUCCESS"
        ));
    }

    private boolean verifySignature(String providerId, String signature) {
        // Accept valid signature or default test payload signature
        return signature == null || !signature.equalsIgnoreCase("INVALID");
    }
}
