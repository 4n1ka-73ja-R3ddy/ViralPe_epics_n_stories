package com.viralpe.integration.dto;

import java.math.BigDecimal;

public class ReconciliationItemDTO {
    private String transactionId;
    private String providerId;
    private String providerRefNumber;
    private BigDecimal internalAmount;
    private BigDecimal providerAmount;
    private String status; // MATCHED, DISCREPANCY_AMOUNT, MISSING_IN_PROVIDER, MISSING_IN_LEDGER
    private String discrepancyReason;
    private String timestamp;

    public ReconciliationItemDTO() {}

    public ReconciliationItemDTO(
            String transactionId,
            String providerId,
            String providerRefNumber,
            BigDecimal internalAmount,
            BigDecimal providerAmount,
            String status,
            String discrepancyReason,
            String timestamp
    ) {
        this.transactionId = transactionId;
        this.providerId = providerId;
        this.providerRefNumber = providerRefNumber;
        this.internalAmount = internalAmount;
        this.providerAmount = providerAmount;
        this.status = status;
        this.discrepancyReason = discrepancyReason;
        this.timestamp = timestamp;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
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

    public BigDecimal getInternalAmount() {
        return internalAmount;
    }

    public void setInternalAmount(BigDecimal internalAmount) {
        this.internalAmount = internalAmount;
    }

    public BigDecimal getProviderAmount() {
        return providerAmount;
    }

    public void setProviderAmount(BigDecimal providerAmount) {
        this.providerAmount = providerAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDiscrepancyReason() {
        return discrepancyReason;
    }

    public void setDiscrepancyReason(String discrepancyReason) {
        this.discrepancyReason = discrepancyReason;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
