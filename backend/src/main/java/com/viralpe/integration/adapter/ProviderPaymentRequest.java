package com.viralpe.integration.adapter;

import java.math.BigDecimal;

public class ProviderPaymentRequest {
    private String correlationId;
    private String idempotencyKey;
    private String category;
    private String billerOrOperatorCode;
    private String accountNumberOrMobile;
    private BigDecimal amount;

    public ProviderPaymentRequest() {}

    public ProviderPaymentRequest(String correlationId, String idempotencyKey, String category, String billerOrOperatorCode, String accountNumberOrMobile, BigDecimal amount) {
        this.correlationId = correlationId;
        this.idempotencyKey = idempotencyKey;
        this.category = category;
        this.billerOrOperatorCode = billerOrOperatorCode;
        this.accountNumberOrMobile = accountNumberOrMobile;
        this.amount = amount;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBillerOrOperatorCode() {
        return billerOrOperatorCode;
    }

    public void setBillerOrOperatorCode(String billerOrOperatorCode) {
        this.billerOrOperatorCode = billerOrOperatorCode;
    }

    public String getAccountNumberOrMobile() {
        return accountNumberOrMobile;
    }

    public void setAccountNumberOrMobile(String accountNumberOrMobile) {
        this.accountNumberOrMobile = accountNumberOrMobile;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
