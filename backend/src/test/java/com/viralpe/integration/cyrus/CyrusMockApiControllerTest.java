package com.viralpe.integration.cyrus;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CyrusMockApiControllerTest {

    private CyrusMockApiController mockController;

    @BeforeEach
    void setUp() {
        mockController = new CyrusMockApiController();
        mockController.resetMockStats();
    }

    @Test
    void testBillFetchEndpoint() {
        Map<String, Object> req = Map.of(
                "member_id", "MEM123",
                "api_key", "secret_key",
                "service_type", "UTILITY",
                "account_id", "1002938481",
                "operator_code", "BESCOM"
        );

        ResponseEntity<Map<String, Object>> response = mockController.fetchBill(req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SUCCESS", response.getBody().get("status"));

        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertEquals("1002938481", data.get("account_id"));
        assertEquals("John Doe", data.get("customer_name"));
    }

    @Test
    void testDeterministicOverrideTriggers() {
        // Test amount == 99 -> Force PENDING (HTTP 201)
        Map<String, Object> pendingReq = Map.of("amount", 99.0, "service_type", "PREPAID");
        ResponseEntity<Map<String, Object>> pendingResp = mockController.processRechargePost(pendingReq);
        assertEquals(HttpStatus.CREATED, pendingResp.getStatusCode());
        assertEquals("PENDING", pendingResp.getBody().get("status"));

        // Test amount == 404 -> Force FAILURE (HTTP 400)
        Map<String, Object> failReq = Map.of("amount", 404.0, "service_type", "UTILITY");
        ResponseEntity<Map<String, Object>> failResp = mockController.processRechargePost(failReq);
        assertEquals(HttpStatus.BAD_REQUEST, failResp.getStatusCode());
        assertEquals("FAILURE", failResp.getBody().get("status"));

        // Test amount == 200 -> Force SUCCESS (HTTP 200)
        Map<String, Object> successReq = Map.of("amount", 200.0, "service_type", "POSTPAID");
        ResponseEntity<Map<String, Object>> successResp = mockController.processRechargePost(successReq);
        assertEquals(HttpStatus.OK, successResp.getStatusCode());
        assertEquals("SUCCESS", successResp.getBody().get("status"));
    }

    @Test
    void test2In10FailureRule() {
        mockController.resetMockStats();

        // Req 1 (% 10 = 1) -> SUCCESS
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());

        // Req 2 (% 10 = 2) -> SUCCESS
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());

        // Req 3 (% 10 = 3) -> FAILURE (20% Failure rule)
        ResponseEntity<Map<String, Object>> req3 = mockController.processRechargePost(Map.of("amount", 299.0));
        assertEquals(HttpStatus.BAD_REQUEST, req3.getStatusCode());
        assertEquals("FAILURE", req3.getBody().get("status"));

        // Req 4, 5, 6 -> SUCCESS
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());

        // Req 7 (% 10 = 7) -> FAILURE (20% Failure rule)
        ResponseEntity<Map<String, Object>> req7 = mockController.processRechargePost(Map.of("amount", 299.0));
        assertEquals(HttpStatus.BAD_REQUEST, req7.getStatusCode());
        assertEquals("FAILURE", req7.getBody().get("status"));

        // Req 8, 9, 10 -> SUCCESS
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());
        assertEquals(HttpStatus.OK, mockController.processRechargePost(Map.of("amount", 299.0)).getStatusCode());
    }

    @Test
    void testStatusQueryEndpoint() {
        ResponseEntity<Map<String, Object>> response = mockController.getStatus("ORD_10091", null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("SUCCESS", response.getBody().get("status"));
    }
}
