package com.viralpe.integration.adapter;

public class ProviderStatusResponse {
    private String providerId;
    private String providerRefNumber;
    private String status; // SUCCESS, FAILED, PENDING
    private String operatorRefNumber;
    private NormalizedProviderError error;

    public ProviderStatusResponse() {}

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOperatorRefNumber() {
        return operatorRefNumber;
    }

    public void setOperatorRefNumber(String operatorRefNumber) {
        this.operatorRefNumber = operatorRefNumber;
    }

    public NormalizedProviderError getError() {
        return error;
    }

    public void setError(NormalizedProviderError error) {
        this.error = error;
    }
}
