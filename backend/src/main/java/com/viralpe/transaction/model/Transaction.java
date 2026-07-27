package com.viralpe.transaction.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String transactionType;
    private Double amount;
    private String status;
    private String provider;
    private String reference;
    private OffsetDateTime createdAt;

    private Double reversalAmountApplied = 0.0;
    private Double walletAmountApplied = 0.0;
    private Double paymentGatewayAmount = 0.0;
    private Double refundToReversal = 0.0;

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

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getReversalAmountApplied() {
        return reversalAmountApplied;
    }

    public void setReversalAmountApplied(Double reversalAmountApplied) {
        this.reversalAmountApplied = reversalAmountApplied;
    }

    public Double getWalletAmountApplied() {
        return walletAmountApplied;
    }

    public void setWalletAmountApplied(Double walletAmountApplied) {
        this.walletAmountApplied = walletAmountApplied;
    }

    public Double getPaymentGatewayAmount() {
        return paymentGatewayAmount;
    }

    public void setPaymentGatewayAmount(Double paymentGatewayAmount) {
        this.paymentGatewayAmount = paymentGatewayAmount;
    }

    public Double getRefundToReversal() {
        return refundToReversal;
    }

    public void setRefundToReversal(Double refundToReversal) {
        this.refundToReversal = refundToReversal;
    }
}
