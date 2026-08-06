package com.viralpe.integration.controller;

import com.viralpe.integration.dto.ProviderWebhookPayloadDTO;
import com.viralpe.integration.orchestration.IdempotencyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ProviderCallbackControllerTest {

    private ProviderCallbackController callbackController;

    @BeforeEach
    void setUp() {
        callbackController = new ProviderCallbackController(new IdempotencyService());
    }

    @Test
    void testValidWebhookProcessing() {
        ProviderWebhookPayloadDTO payload = new ProviderWebhookPayloadDTO();
        payload.setProviderId("KWIK");
        payload.setProviderReferenceId("KWIK-REF-101");
        payload.setOriginalCorrelationId("REQ-CORR-101");
        payload.setStatus("SUCCESS");
        payload.setSignature("VALID_SIG");

        ResponseEntity<Map<String, Object>> response = callbackController.handleProviderWebhook("KWIK", "VALID_SIG", "IDEM-CB-1", payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(true, response.getBody().get("received"));
        assertEquals(false, response.getBody().get("duplicate"));
        assertEquals("SUCCESS", response.getBody().get("processedStatus"));
    }

    @Test
    void testInvalidSignatureRejection() {
        ProviderWebhookPayloadDTO payload = new ProviderWebhookPayloadDTO();
        payload.setProviderId("GOTER");
        payload.setProviderReferenceId("GOTER-REF-102");
        payload.setSignature("INVALID");

        ResponseEntity<Map<String, Object>> response = callbackController.handleProviderWebhook("GOTER", "INVALID", "IDEM-CB-2", payload);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("REJECTED", response.getBody().get("status"));
        assertEquals("INVALID_SIGNATURE", response.getBody().get("reason"));
    }

    @Test
    void testDuplicateCallbackIdempotency() {
        ProviderWebhookPayloadDTO payload = new ProviderWebhookPayloadDTO();
        payload.setProviderId("KWIK");
        payload.setProviderReferenceId("KWIK-REF-103");
        payload.setOriginalCorrelationId("REQ-CORR-103");
        payload.setStatus("SUCCESS");

        ResponseEntity<Map<String, Object>> res1 = callbackController.handleProviderWebhook("KWIK", "SIG", "SAME-CB-KEY", payload);
        ResponseEntity<Map<String, Object>> res2 = callbackController.handleProviderWebhook("KWIK", "SIG", "SAME-CB-KEY", payload);

        assertEquals(HttpStatus.OK, res1.getStatusCode());
        assertEquals(HttpStatus.OK, res2.getStatusCode());
        assertEquals(false, res1.getBody().get("duplicate"));
        assertEquals(true, res2.getBody().get("duplicate"));
    }
}
