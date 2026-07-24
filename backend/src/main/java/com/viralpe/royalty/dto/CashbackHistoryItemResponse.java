package com.viralpe.royalty.dto;

import java.time.OffsetDateTime;

public class CashbackHistoryItemResponse {

    private Long cashbackLedgerId;

    private Long sourceTransactionId;

    private String transactionType;

    private Double grossCashback;

    private Double pincodeDeduction;

    private Double netCashback;

    private OffsetDateTime createdAt;

    public CashbackHistoryItemResponse() {
    }

    public Long getCashbackLedgerId() {
        return cashbackLedgerId;
    }

    public void setCashbackLedgerId(Long cashbackLedgerId) {
        this.cashbackLedgerId = cashbackLedgerId;
    }

    public Long getSourceTransactionId() {
        return sourceTransactionId;
    }

    public void setSourceTransactionId(Long sourceTransactionId) {
        this.sourceTransactionId = sourceTransactionId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public Double getGrossCashback() {
        return grossCashback;
    }

    public void setGrossCashback(Double grossCashback) {
        this.grossCashback = grossCashback;
    }

    public Double getPincodeDeduction() {
        return pincodeDeduction;
    }

    public void setPincodeDeduction(Double pincodeDeduction) {
        this.pincodeDeduction = pincodeDeduction;
    }

    public Double getNetCashback() {
        return netCashback;
    }

    public void setNetCashback(Double netCashback) {
        this.netCashback = netCashback;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}