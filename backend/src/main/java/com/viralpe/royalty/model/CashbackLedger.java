package com.viralpe.royalty.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "cashback_ledger")
public class CashbackLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "source_transaction_id")
    private Long sourceTransactionId;

    @Column(name = "transaction_type")
    private String transactionType;

    @Column(name = "gross_cashback")
    private Double grossCashback;

    @Column(name = "pincode_deduction")
    private Double pincodeDeduction;

    @Column(name = "net_cashback")
    private Double netCashback;

    @Column(name = "cashback_percentage")
    private Double cashbackPercentage;

    @Column(name = "pincode_percentage")
    private Double pincodePercentage;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

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
