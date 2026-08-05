package com.viralpe.integration.kwik;

import com.viralpe.integration.adapter.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class KwikProviderAdapterTest {

    private KwikProviderAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new KwikProviderAdapter();
    }

    @Test
    void testGetProviderId() {
        assertEquals("KWIK", adapter.getProviderId());
    }

    @Test
    void testAuthentication() {
        assertTrue(adapter.authenticate());
        assertNotNull(adapter.getActiveToken());
        assertTrue(adapter.getActiveToken().startsWith("KWIK-BEARER-TOKEN-"));
    }

    @Test
    void testFetchCategoriesAndBillers() {
        List<String> categories = adapter.fetchCategories();
        assertTrue(categories.contains("RECHARGE"));
        assertTrue(categories.contains("UTILITY"));
        assertTrue(categories.contains("VOUCHER"));

        List<String> rechargeBillers = adapter.fetchBillers("RECHARGE");
        assertTrue(rechargeBillers.contains("JIO"));
        assertTrue(rechargeBillers.contains("AIRTEL"));
    }

    @Test
    void testValidateAccount() {
        assertTrue(adapter.validateAccount("RECHARGE", "JIO", "9876543210"));
        assertFalse(adapter.validateAccount("RECHARGE", "JIO", "123")); // Invalid mobile
        assertTrue(adapter.validateAccount("UTILITY", "BESCOM", "100299812"));
    }

    @Test
    void testFetchBillSuccess() {
        ProviderBillFetchRequest req = new ProviderBillFetchRequest("RECHARGE", "JIO", "9876543210", "CORR-123");
        ProviderBillFetchResponse res = adapter.fetchBill(req);

        assertTrue(res.isSuccess());
        assertEquals("KWIK", res.getProviderId());
        assertNotNull(res.getAmountDue());
        assertNull(res.getError());
    }

    @Test
    void testFetchBillInvalidAccount() {
        ProviderBillFetchRequest req = new ProviderBillFetchRequest("RECHARGE", "JIO", "123", "CORR-123");
        ProviderBillFetchResponse res = adapter.fetchBill(req);

        assertFalse(res.isSuccess());
        assertNotNull(res.getError());
        assertEquals("INVALID_ACCOUNT", res.getError().getNormalizedCode());
    }

    @Test
    void testExecutePaymentSuccess() {
        ProviderPaymentRequest req = new ProviderPaymentRequest(
                "CORR-881", "IDEM-992", "RECHARGE", "JIO", "9876543210", new BigDecimal("299.00")
        );

        ProviderPaymentResponse res = adapter.executePayment(req);

        assertTrue(res.isSuccess());
        assertEquals("SUCCESS", res.getStatus());
        assertEquals("KWIK", res.getProviderId());
        assertNotNull(res.getProviderRefNumber());
        assertTrue(res.getProviderRefNumber().startsWith("KWIK-TXN-"));
    }

    @Test
    void testCheckStatus() {
        ProviderStatusResponse res = adapter.checkStatus("KWIK-TXN-100293812");
        assertEquals("SUCCESS", res.getStatus());
        assertEquals("KWIK", res.getProviderId());
    }

    @Test
    void testErrorNormalization() {
        NormalizedProviderError err1 = adapter.normalizeError("KWIK_500_TIMEOUT", "Gateway timeout");
        assertEquals("TIMEOUT", err1.getNormalizedCode());
        assertTrue(err1.isRetryable());

        NormalizedProviderError err2 = adapter.normalizeError("KWIK_404_ACCOUNT", "Mobile not found");
        assertEquals("INVALID_ACCOUNT", err2.getNormalizedCode());
        assertFalse(err2.isRetryable());
    }
}
