package com.viralpe.integration.orchestration;

import com.viralpe.integration.adapter.*;
import com.viralpe.integration.dto.*;
import com.viralpe.integration.goterr.GoterrProviderAdapter;
import com.viralpe.integration.kwik.KwikProviderAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProviderOrchestrationServiceTest {

    private ProviderOrchestrationService orchestrationService;

    @BeforeEach
    void setUp() {
        IdempotencyService idempotencyService = new IdempotencyService();
        List<ProviderAdapter> adapters = List.of(
                new KwikProviderAdapter(),
                new GoterrProviderAdapter()
        );
        orchestrationService = new ProviderOrchestrationService(adapters, idempotencyService);
    }

    @Test
    void testGetAllConfigs() {
        List<ProviderConfigDTO> configs = orchestrationService.getAllProviderConfigs();
        assertEquals(2, configs.size());
    }

    @Test
    void testPrimaryProviderRouting() {
        ProviderExecuteRequestDTO req = new ProviderExecuteRequestDTO();
        req.setRequestCorrelationId("CORR-TEST-1");
        req.setUserId(1L);
        req.setServiceType("RECHARGE");
        req.setBillerOrOperatorCode("JIO");
        req.setAccountNumberOrMobile("9876543210");
        req.setAmount(new BigDecimal("299.00"));
        req.setIdempotencyKey("IDEM-TEST-1");

        ProviderExecuteResponseDTO res = orchestrationService.executeOrchestratedPayment(req);

        assertEquals("SUCCESS", res.getStatus());
        assertEquals("KWIK", res.getAssignedProviderId());
        assertFalse(res.isFailoverOccurred());
        assertEquals(List.of("KWIK"), res.getAttemptedProviders());
    }

    @Test
    void testFailoverToSecondaryWhenPrimaryDisabled() {
        // Disable KWIK provider via Feature Toggle
        orchestrationService.updateProviderConfig("KWIK", false, 1, 4.5);

        ProviderExecuteRequestDTO req = new ProviderExecuteRequestDTO();
        req.setRequestCorrelationId("CORR-TEST-2");
        req.setUserId(1L);
        req.setServiceType("RECHARGE");
        req.setBillerOrOperatorCode("JIO");
        req.setAccountNumberOrMobile("9876543210");
        req.setAmount(new BigDecimal("299.00"));
        req.setIdempotencyKey("IDEM-TEST-2");

        ProviderExecuteResponseDTO res = orchestrationService.executeOrchestratedPayment(req);

        assertEquals("SUCCESS", res.getStatus());
        assertEquals("GOTER", res.getAssignedProviderId());
        assertFalse(res.isFailoverOccurred()); // Goterr was selected directly as priority 1 active candidate
        assertEquals(List.of("GOTER"), res.getAttemptedProviders());
    }

    @Test
    void testIdempotencyProtection() {
        ProviderExecuteRequestDTO req = new ProviderExecuteRequestDTO();
        req.setRequestCorrelationId("CORR-TEST-3");
        req.setUserId(1L);
        req.setServiceType("RECHARGE");
        req.setBillerOrOperatorCode("JIO");
        req.setAccountNumberOrMobile("9876543210");
        req.setAmount(new BigDecimal("299.00"));
        req.setIdempotencyKey("IDEM-SAME-KEY");

        ProviderExecuteResponseDTO res1 = orchestrationService.executeOrchestratedPayment(req);
        ProviderExecuteResponseDTO res2 = orchestrationService.executeOrchestratedPayment(req);

        assertSame(res1, res2);
        assertEquals(res1.getTransactionId(), res2.getTransactionId());
    }

    @Test
    void testRuntimeFailoverWhenPrimaryProviderFails() {
        ProviderAdapter failingKwik = new ProviderAdapter() {
            @Override public String getProviderId() { return "KWIK"; }
            @Override public boolean authenticate() { return true; }
            @Override public List<String> fetchCategories() { return List.of("RECHARGE"); }
            @Override public List<String> fetchBillers(String c) { return List.of("JIO"); }
            @Override public ProviderBillFetchResponse fetchBill(ProviderBillFetchRequest r) { return null; }
            @Override public boolean validateAccount(String c, String b, String a) { return true; }
            @Override public ProviderPaymentResponse executePayment(ProviderPaymentRequest r) {
                ProviderPaymentResponse fail = new ProviderPaymentResponse();
                fail.setSuccess(false);
                fail.setStatus("FAILED");
                return fail;
            }
            @Override public ProviderStatusResponse checkStatus(String ref) { return null; }
            @Override public NormalizedProviderError normalizeError(String c, String m) { return null; }
        };

        ProviderOrchestrationService serviceWithFailingPrimary = new ProviderOrchestrationService(
                List.of(failingKwik, new GoterrProviderAdapter()),
                new IdempotencyService()
        );

        ProviderExecuteRequestDTO req = new ProviderExecuteRequestDTO();
        req.setRequestCorrelationId("CORR-FAILOVER-TEST");
        req.setUserId(1L);
        req.setServiceType("RECHARGE");
        req.setBillerOrOperatorCode("JIO");
        req.setAccountNumberOrMobile("9876543210");
        req.setAmount(new BigDecimal("299.00"));
        req.setIdempotencyKey("IDEM-FAILOVER-1");

        ProviderExecuteResponseDTO res = serviceWithFailingPrimary.executeOrchestratedPayment(req);

        assertEquals("SUCCESS", res.getStatus());
        assertEquals("GOTER", res.getAssignedProviderId());
        assertTrue(res.isFailoverOccurred());
        assertEquals(List.of("KWIK", "GOTER"), res.getAttemptedProviders());
    }
}
