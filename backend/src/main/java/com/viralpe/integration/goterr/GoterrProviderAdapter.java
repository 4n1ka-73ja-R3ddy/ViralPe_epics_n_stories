package com.viralpe.integration.goterr;

import com.viralpe.integration.adapter.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class GoterrProviderAdapter implements ProviderAdapter {

    private static final String PROVIDER_ID = "GOTER";
    private String activeApiKey;

    public GoterrProviderAdapter() {
        authenticate();
    }

    @Override
    public String getProviderId() {
        return PROVIDER_ID;
    }

    @Override
    public boolean authenticate() {
        this.activeApiKey = "GOTER-SIG-KEY-" + UUID.randomUUID().toString().substring(0, 8);
        return true;
    }

    @Override
    public List<String> fetchCategories() {
        return List.of("RECHARGE", "UTILITY");
    }

    @Override
    public List<String> fetchBillers(String category) {
        if (category == null) return Collections.emptyList();
        switch (category.toUpperCase()) {
            case "RECHARGE":
                return List.of("JIO", "AIRTEL", "VI");
            case "UTILITY":
                return List.of("BESCOM", "TATA_POWER");
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
            response.setError(normalizeError("GOTER_ERR_INVALID_ACCOUNT", "Account or mobile number required"));
            return response;
        }

        boolean isValid = validateAccount(request.getCategory(), request.getBillerCode(), request.getAccountNumber());
        if (!isValid) {
            response.setSuccess(false);
            response.setError(normalizeError("GOTER_ERR_INVALID_ACCOUNT", "Invalid account number for Goterr provider"));
            return response;
        }

        response.setSuccess(true);
        response.setBillerName(request.getBillerCode() != null ? request.getBillerCode() : "Goterr Biller");
        response.setCustomerName("Goterr Verified User");
        response.setAmountDue(new BigDecimal("299.00"));
        response.setDueDate("2026-08-28");
        response.setBillNumber("GOTER-BILL-" + Math.abs(request.getAccountNumber().hashCode()));
        response.setRawProviderRef("GOTER-FETCH-REF-" + System.currentTimeMillis());

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
            response.setError(normalizeError("GOTER_ERR_AMOUNT", "Amount must be greater than zero"));
            return response;
        }

        if (!validateAccount(request.getCategory(), request.getBillerOrOperatorCode(), request.getAccountNumberOrMobile())) {
            response.setSuccess(false);
            response.setStatus("FAILED");
            response.setError(normalizeError("GOTER_ERR_INVALID_ACCOUNT", "Invalid account/mobile number"));
            return response;
        }

        String goterrRef = "GOTER-TXN-" + System.currentTimeMillis();
        String operatorRef = "OPR-GOTER-" + (100000 + new Random().nextInt(900000));

        response.setSuccess(true);
        response.setStatus("SUCCESS");
        response.setProviderRefNumber(goterrRef);
        response.setOperatorRefNumber(operatorRef);
        response.setAmount(request.getAmount());

        return response;
    }

    @Override
    public ProviderStatusResponse checkStatus(String providerRefNumber) {
        ProviderStatusResponse response = new ProviderStatusResponse();
        response.setProviderId(PROVIDER_ID);
        response.setProviderRefNumber(providerRefNumber);

        if (providerRefNumber == null || !providerRefNumber.startsWith("GOTER-")) {
            response.setStatus("FAILED");
            response.setError(normalizeError("GOTER_ERR_REF_NOT_FOUND", "Reference not found on Goterr network"));
            return response;
        }

        response.setStatus("SUCCESS");
        response.setOperatorRefNumber("OPR-GOTER-STATUS-" + System.currentTimeMillis());
        return response;
    }

    @Override
    public NormalizedProviderError normalizeError(String rawErrorCode, String rawErrorMessage) {
        String code = rawErrorCode != null ? rawErrorCode.toUpperCase() : "UNKNOWN";
        String normalizedCode;
        boolean retryable = false;

        if (code.contains("INVALID_ACCOUNT") || code.contains("404")) {
            normalizedCode = "INVALID_ACCOUNT";
        } else if (code.contains("TIMEOUT") || code.contains("504")) {
            normalizedCode = "TIMEOUT";
            retryable = true;
        } else if (code.contains("AMOUNT") || code.contains("BALANCE")) {
            normalizedCode = "INSUFFICIENT_FUNDS";
        } else if (code.contains("DOWN") || code.contains("MAINTENANCE")) {
            normalizedCode = "BILLER_DOWN";
            retryable = true;
        } else {
            normalizedCode = "UNKNOWN_ERROR";
        }

        return new NormalizedProviderError(
                rawErrorCode,
                normalizedCode,
                rawErrorMessage != null ? rawErrorMessage : "Goterr error",
                retryable
        );
    }

    public String getActiveApiKey() {
        return activeApiKey;
    }
}
