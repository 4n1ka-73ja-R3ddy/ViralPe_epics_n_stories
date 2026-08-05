package com.viralpe.integration.dto;

import java.math.BigDecimal;

public class ProviderExecuteRequestDTO {
    private String requestCorrelationId;
    private Long userId;
    private String serviceType; // RECHARGE, UTILITY, VOUCHER
    private String billerOrOperatorCode;
    private String accountNumberOrMobile;
    private BigDecimal amount;
    private String idempotencyKey;
    private String preferredProviderId;

    public ProviderExecuteRequestDTO() {}

    public String getRequestCorrelationId() {
        return requestCorrelationId;
    }

    public void setRequestCorrelationId(String requestCorrelationId) {
        this.requestCorrelationId = requestCorrelationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
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

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getPreferredProviderId() {
        return preferredProviderId;
    }

    public void setPreferredProviderId(String preferredProviderId) {
        this.preferredProviderId = preferredProviderId;
    }
}
