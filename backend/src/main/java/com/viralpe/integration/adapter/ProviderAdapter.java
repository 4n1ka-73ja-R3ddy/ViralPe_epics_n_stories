package com.viralpe.integration.adapter;

import java.util.List;

public interface ProviderAdapter {

    /**
     * Unique Provider Identifier (e.g. KWIK, GOTER, CYRUS)
     */
    String getProviderId();

    /**
     * Authenticates with provider API or returns active access token
     */
    boolean authenticate();

    /**
     * Fetches supported categories for this provider
     */
    List<String> fetchCategories();

    /**
     * Fetches supported billers/operators for a given category
     */
    List<String> fetchBillers(String category);

    /**
     * Fetches live bill details from provider
     */
    ProviderBillFetchResponse fetchBill(ProviderBillFetchRequest request);

    /**
     * Validates account/consumer number before payment
     */
    boolean validateAccount(String category, String billerCode, String accountNumber);

    /**
     * Executes payment or recharge via provider API
     */
    ProviderPaymentResponse executePayment(ProviderPaymentRequest request);

    /**
     * Checks current status of a transaction with provider
     */
    ProviderStatusResponse checkStatus(String providerRefNumber);

    /**
     * Normalizes provider-specific raw error codes to standard internal format
     */
    NormalizedProviderError normalizeError(String rawErrorCode, String rawErrorMessage);
}
