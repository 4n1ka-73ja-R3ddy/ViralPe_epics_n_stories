package com.viralpe.integration.orchestration;

import com.viralpe.integration.adapter.ProviderAdapter;
import com.viralpe.integration.adapter.ProviderPaymentRequest;
import com.viralpe.integration.adapter.ProviderPaymentResponse;
import com.viralpe.integration.controller.ProviderFailureSimulationController;
import com.viralpe.integration.dto.ProviderExecuteRequestDTO;
import com.viralpe.integration.dto.ProviderExecuteResponseDTO;
import com.viralpe.integration.goterr.GoterrProviderAdapter;
import com.viralpe.integration.kwik.KwikProviderAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ProviderFailureSimulationTest {

    private ProviderOrchestrationService orchestrationService;
    private KwikProviderAdapter kwikAdapter;
    private GoterrProviderAdapter goterrAdapter;

    @BeforeEach
    public void setUp() {
        IdempotencyService idempotencyService = new IdempotencyService();
        kwikAdapter = Mockito.mock(KwikProviderAdapter.class);
        goterrAdapter = Mockito.mock(GoterrProviderAdapter.class);

        when(kwikAdapter.getProviderId()).thenReturn("KWIK");
        when(goterrAdapter.getProviderId()).thenReturn("GOTER");

        ProviderPaymentResponse kwikResp = new ProviderPaymentResponse();
        kwikResp.setSuccess(true);
        kwikResp.setStatus("SUCCESS");
        kwikResp.setProviderRefNumber("KWIK-REF-100");

        ProviderPaymentResponse goterResp = new ProviderPaymentResponse();
        goterResp.setSuccess(true);
        goterResp.setStatus("SUCCESS");
        goterResp.setProviderRefNumber("GOTER-REF-200");

        when(kwikAdapter.executePayment(any(ProviderPaymentRequest.class))).thenReturn(kwikResp);
        when(goterrAdapter.executePayment(any(ProviderPaymentRequest.class))).thenReturn(goterResp);

        orchestrationService = new ProviderOrchestrationService(
                List.of(kwikAdapter, goterrAdapter),
                idempotencyService
        );

        orchestrationService.updateProviderConfig("KWIK", true, 1, 5.0);
        orchestrationService.updateProviderConfig("GOTER", true, 2, 4.0);
    }

    @Test
    @DisplayName("Task 5: Simulated TIMEOUT on primary KWIK triggers automatic safe failover to GOTER")
    public void testSimulatedTimeoutTriggersFailover() {
        orchestrationService.setSimulatedFault("KWIK", "TIMEOUT");

        ProviderExecuteRequestDTO request = new ProviderExecuteRequestDTO();
        request.setAmount(BigDecimal.valueOf(100.0));
        request.setServiceType("RECHARGE");
        request.setBillerOrOperatorCode("JIO");
        request.setAccountNumberOrMobile("9876543210");
        request.setIdempotencyKey("FAULT-TEST-KEY-01");

        ProviderExecuteResponseDTO response = orchestrationService.executeOrchestratedPayment(request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("GOTER", response.getAssignedProviderId());
        assertTrue(response.isFailoverOccurred());
        assertTrue(response.getAttemptedProviders().contains("KWIK"));
        assertTrue(response.getAttemptedProviders().contains("GOTER"));
    }

    @Test
    @DisplayName("Task 5: Simulated HTTP_500 on primary KWIK triggers automatic safe failover to GOTER")
    public void testSimulatedHttp500TriggersFailover() {
        orchestrationService.setSimulatedFault("KWIK", "HTTP_500");

        ProviderExecuteRequestDTO request = new ProviderExecuteRequestDTO();
        request.setAmount(BigDecimal.valueOf(200.0));
        request.setServiceType("RECHARGE");
        request.setBillerOrOperatorCode("AIRTEL");
        request.setAccountNumberOrMobile("9876543211");
        request.setIdempotencyKey("FAULT-TEST-KEY-02");

        ProviderExecuteResponseDTO response = orchestrationService.executeOrchestratedPayment(request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("GOTER", response.getAssignedProviderId());
        assertTrue(response.isFailoverOccurred());
    }

    @Test
    @DisplayName("Task 5: ProviderFailureSimulationController REST endpoints set and clear simulated faults")
    public void testFailureSimulationController() {
        ProviderFailureSimulationController controller = new ProviderFailureSimulationController(orchestrationService);

        ResponseEntity<Map<String, Object>> setResp = controller.setSimulatedFault(Map.of("providerId", "KWIK", "faultMode", "TIMEOUT"));
        assertEquals(200, setResp.getStatusCode().value());
        assertEquals("TIMEOUT", setResp.getBody().get("faultMode"));

        ResponseEntity<Map<String, String>> getResp = controller.getSimulatedFaults();
        assertEquals("TIMEOUT", getResp.getBody().get("KWIK"));

        controller.clearAllFaults();
        ResponseEntity<Map<String, String>> clearedResp = controller.getSimulatedFaults();
        assertNull(clearedResp.getBody().get("KWIK"));
    }
}
