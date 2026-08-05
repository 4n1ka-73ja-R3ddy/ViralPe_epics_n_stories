package com.viralpe.integration.adapter;

import java.math.BigDecimal;

public class ProviderPaymentResponse {
    private boolean success;
    private String status; // SUCCESS, FAILED, PENDING
    private String providerId;
    private String providerRefNumber;
    private String operatorRefNumber;
    private BigDecimal amount;
    private String correlationId;
    private NormalizedProviderError error;

    public ProviderPaymentResponse() {}

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderRefNumber() {
        return providerRefNumber;
    }

    public void setProviderRefNumber(String providerRefNumber) {
        this.providerRefNumber = providerRefNumber;
    }

    public String getOperatorRefNumber() {
        return operatorRefNumber;
    }

    public void setOperatorRefNumber(String operatorRefNumber) {
        this.operatorRefNumber = operatorRefNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public NormalizedProviderError getError() {
        return error;
    }

    public void setError(NormalizedProviderError error) {
        this.error = error;
    }
}
