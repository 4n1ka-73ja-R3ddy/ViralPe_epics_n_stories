package com.viralpe.integration.goterr;

import com.viralpe.integration.adapter.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GoterrProviderAdapterTest {

    private GoterrProviderAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new GoterrProviderAdapter();
    }

    @Test
    void testGetProviderId() {
        assertEquals("GOTER", adapter.getProviderId());
    }

    @Test
    void testAuthentication() {
        assertTrue(adapter.authenticate());
        assertNotNull(adapter.getActiveApiKey());
        assertTrue(adapter.getActiveApiKey().startsWith("GOTER-SIG-KEY-"));
    }

    @Test
    void testFetchCategoriesAndBillers() {
        List<String> categories = adapter.fetchCategories();
        assertTrue(categories.contains("RECHARGE"));
        assertTrue(categories.contains("UTILITY"));

        List<String> billers = adapter.fetchBillers("RECHARGE");
        assertTrue(billers.contains("JIO"));
    }

    @Test
    void testExecutePaymentSuccess() {
        ProviderPaymentRequest req = new ProviderPaymentRequest(
                "CORR-GOT-101", "IDEM-GOT-101", "RECHARGE", "JIO", "9876543210", new BigDecimal("299.00")
        );

        ProviderPaymentResponse res = adapter.executePayment(req);

        assertTrue(res.isSuccess());
        assertEquals("SUCCESS", res.getStatus());
        assertEquals("GOTER", res.getProviderId());
        assertNotNull(res.getProviderRefNumber());
        assertTrue(res.getProviderRefNumber().startsWith("GOTER-TXN-"));
    }

    @Test
    void testErrorNormalization() {
        NormalizedProviderError err = adapter.normalizeError("GOTER_ERR_TIMEOUT", "Timeout occurred");
        assertEquals("TIMEOUT", err.getNormalizedCode());
        assertTrue(err.isRetryable());
    }
}
