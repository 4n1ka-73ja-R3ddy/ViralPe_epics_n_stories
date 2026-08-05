package com.viralpe.integration.dto;

public class ProviderWebhookPayloadDTO {
    private String providerId;
    private String providerReferenceId;
    private String originalCorrelationId;
    private String status; // SUCCESS, FAILED, PENDING
    private String operatorRefNumber;
    private String normalizedErrorCode;
    private String errorMessage;
    private String signature;
    private String timestamp;

    public ProviderWebhookPayloadDTO() {}

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderReferenceId() {
        return providerReferenceId;
    }

    public void setProviderReferenceId(String providerReferenceId) {
        this.providerReferenceId = providerReferenceId;
    }

    public String getOriginalCorrelationId() {
        return originalCorrelationId;
    }

    public void setOriginalCorrelationId(String originalCorrelationId) {
        this.originalCorrelationId = originalCorrelationId;
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

    public String getNormalizedErrorCode() {
        return normalizedErrorCode;
    }

    public void setNormalizedErrorCode(String normalizedErrorCode) {
        this.normalizedErrorCode = normalizedErrorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
