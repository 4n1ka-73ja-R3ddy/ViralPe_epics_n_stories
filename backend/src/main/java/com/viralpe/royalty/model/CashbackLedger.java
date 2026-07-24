package com.viralpe.royalty.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "cashback_ledger")
public class CashbackLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long sourceTransactionId;

    private String transactionType;

    private Double grossCashback;

    private Double pincodeDeduction;

    private Double netCashback;

    private Double cashbackPercentage;

    private Double pincodePercentage;

    private OffsetDateTime createdAt;

    public CashbackLedger() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Double getCashbackPercentage() {
        return cashbackPercentage;
    }

    public void setCashbackPercentage(Double cashbackPercentage) {
        this.cashbackPercentage = cashbackPercentage;
    }

    public Double getPincodePercentage() {
        return pincodePercentage;
    }

    public void setPincodePercentage(Double pincodePercentage) {
        this.pincodePercentage = pincodePercentage;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}