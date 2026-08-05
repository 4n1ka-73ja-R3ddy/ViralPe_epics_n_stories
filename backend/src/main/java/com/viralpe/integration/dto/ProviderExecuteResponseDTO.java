package com.viralpe.integration.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProviderExecuteResponseDTO {
    private String status; // SUCCESS, FAILED, PENDING
    private String transactionId;
    private String assignedProviderId;
    private String providerReferenceId;
    private String requestCorrelationId;
    private BigDecimal amountPaid;
    private boolean failoverOccurred;
    private List<String> attemptedProviders;
    private String normalizedErrorCode;
    private String errorMessage;
    private String timestamp;

    public ProviderExecuteResponseDTO() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getAssignedProviderId() {
        return assignedProviderId;
    }

    public void setAssignedProviderId(String assignedProviderId) {
        this.assignedProviderId = assignedProviderId;
    }

    public String getProviderReferenceId() {
        return providerReferenceId;
    }

    public void setProviderReferenceId(String providerReferenceId) {
        this.providerReferenceId = providerReferenceId;
    }

    public String getRequestCorrelationId() {
        return requestCorrelationId;
    }

    public void setRequestCorrelationId(String requestCorrelationId) {
        this.requestCorrelationId = requestCorrelationId;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public boolean isFailoverOccurred() {
        return failoverOccurred;
    }

    public void setFailoverOccurred(boolean failoverOccurred) {
        this.failoverOccurred = failoverOccurred;
    }

    public List<String> getAttemptedProviders() {
        return attemptedProviders;
    }

    public void setAttemptedProviders(List<String> attemptedProviders) {
        this.attemptedProviders = attemptedProviders;
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

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
