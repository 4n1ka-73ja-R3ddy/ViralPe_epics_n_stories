package com.viralpe.integration.kwik;

import com.viralpe.integration.adapter.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class KwikProviderAdapter implements ProviderAdapter {

    private static final String PROVIDER_ID = "KWIK";
    private String activeToken;
    private long tokenExpiryTime;

    public KwikProviderAdapter() {
        authenticate();
    }

    @Override
    public String getProviderId() {
        return PROVIDER_ID;
    }

    @Override
    public boolean authenticate() {
        // Simulate Kwik API Auth token generation
        this.activeToken = "KWIK-BEARER-TOKEN-" + UUID.randomUUID().toString().substring(0, 8);
        this.tokenExpiryTime = System.currentTimeMillis() + 3600000; // 1 hour
        return true;
    }

    @Override
    public List<String> fetchCategories() {
        return List.of("RECHARGE", "UTILITY", "VOUCHER");
    }

    @Override
    public List<String> fetchBillers(String category) {
        if (category == null) return Collections.emptyList();
        switch (category.toUpperCase()) {
            case "RECHARGE":
                return List.of("JIO", "AIRTEL", "VI", "BSNL");
            case "UTILITY":
                return List.of("BESCOM", "TATA_POWER", "ACT_FIBERNET", "AIRTEL_XSTREAM");
            case "VOUCHER":
                return List.of("AMAZON_PAY", "FLIPKART", "MYNTRA", "SWIGGY");
            default:
                return Collections.emptyList();
        }
    }

    @Override
    public ProviderBillFetchResponse fetchBill(ProviderBillFetchRequest request) {
        ProviderBillFetchResponse response = new ProviderBillFetchResponse();
        response.setProviderId(PROVIDER_ID);

        if (request == null || request.getAccountNumber() == null || request.getAccountNumber().trim().isEmpty()) {
            response.setSuccess(false);
            response.setError(normalizeError("KWIK_404_ACCOUNT", "Account number is required"));
            return response;
        }

        boolean isValid = validateAccount(request.getCategory(), request.getBillerCode(), request.getAccountNumber());
        if (!isValid) {
            response.setSuccess(false);
            response.setError(normalizeError("KWIK_404_ACCOUNT", "Invalid account or mobile number for Kwik provider"));
            return response;
        }

        response.setSuccess(true);
        response.setBillerName(request.getBillerCode() != null ? request.getBillerCode() : "Kwik Biller");
        response.setCustomerName("Valued Customer");
        response.setAmountDue(new BigDecimal("299.00"));
        response.setDueDate("2026-08-30");
        response.setBillNumber("KWIK-BILL-" + Math.abs(request.getAccountNumber().hashCode()));
        response.setRawProviderRef("KWIK-FETCH-REF-" + System.currentTimeMillis());

        return response;
    }

    @Override
    public boolean validateAccount(String category, String billerCode, String accountNumber) {
        if (accountNumber == null) return false;
        String clean = accountNumber.trim();
        if ("RECHARGE".equalsIgnoreCase(category)) {
            return clean.matches("^[6-9]\\d{9}$");
        }
        return clean.length() >= 5;
    }

    @Override
    public ProviderPaymentResponse executePayment(ProviderPaymentRequest request) {
        ProviderPaymentResponse response = new ProviderPaymentResponse();
        response.setProviderId(PROVIDER_ID);
        response.setCorrelationId(request != null ? request.getCorrelationId() : null);

        if (request == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            response.setSuccess(false);
            response.setStatus("FAILED");
            response.setError(normalizeError("KWIK_400_INVALID_AMOUNT", "Payment amount must be greater than zero"));
            return response;
        }

        if (!validateAccount(request.getCategory(), request.getBillerOrOperatorCode(), request.getAccountNumberOrMobile())) {
            response.setSuccess(false);
            response.setStatus("FAILED");
            response.setError(normalizeError("KWIK_404_ACCOUNT", "Invalid account/mobile number"));
            return response;
        }

        // Simulate successful Kwik payment execution
        String kwikRef = "KWIK-TXN-" + System.currentTimeMillis();
        String operatorRef = "OPR-KWIK-" + (100000 + new Random().nextInt(900000));

        response.setSuccess(true);
        response.setStatus("SUCCESS");
        response.setProviderRefNumber(kwikRef);
        response.setOperatorRefNumber(operatorRef);
        response.setAmount(request.getAmount());

        return response;
    }

    @Override
    public ProviderStatusResponse checkStatus(String providerRefNumber) {
        ProviderStatusResponse response = new ProviderStatusResponse();
        response.setProviderId(PROVIDER_ID);
        response.setProviderRefNumber(providerRefNumber);

        if (providerRefNumber == null || !providerRefNumber.startsWith("KWIK-")) {
            response.setStatus("FAILED");
            response.setError(normalizeError("KWIK_404_REF", "Transaction reference not found on Kwik network"));
            return response;
        }

        response.setStatus("SUCCESS");
        response.setOperatorRefNumber("OPR-KWIK-STATUS-" + System.currentTimeMillis());
        return response;
    }

    @Override
    public NormalizedProviderError normalizeError(String rawErrorCode, String rawErrorMessage) {
        String code = rawErrorCode != null ? rawErrorCode.toUpperCase() : "UNKNOWN";
        String normalizedCode;
        boolean retryable = false;

        if (code.contains("404") || code.contains("ACCOUNT")) {
            normalizedCode = "INVALID_ACCOUNT";
        } else if (code.contains("500") || code.contains("TIMEOUT")) {
            normalizedCode = "TIMEOUT";
            retryable = true;
        } else if (code.contains("402") || code.contains("BALANCE")) {
            normalizedCode = "INSUFFICIENT_FUNDS";
        } else if (code.contains("503") || code.contains("DOWN")) {
            normalizedCode = "BILLER_DOWN";
            retryable = true;
        } else {
            normalizedCode = "UNKNOWN_ERROR";
        }

        return new NormalizedProviderError(
                rawErrorCode,
                normalizedCode,
                rawErrorMessage != null ? rawErrorMessage : "Provider execution error",
                retryable
        );
    }

    public String getActiveToken() {
        return activeToken;
    }
}
