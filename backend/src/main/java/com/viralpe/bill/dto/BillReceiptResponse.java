package com.viralpe.bill.dto;

import java.time.OffsetDateTime;

public class BillReceiptResponse {

    private Long billPaymentId;
    private Long userId;
    private String category;
    private String biller;
    private String consumerNumber;
    private Double amount;
    private String status;
    private String providerReference;
    private String receiptNumber;
    private OffsetDateTime createdAt;

    public BillReceiptResponse() {
    }

    public Long getBillPaymentId() {
        return billPaymentId;
    }

    public void setBillPaymentId(Long billPaymentId) {
        this.billPaymentId = billPaymentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBiller() {
        return biller;
    }

    public void setBiller(String biller) {
        this.biller = biller;
    }

    public String getConsumerNumber() {
        return consumerNumber;
    }

    public void setConsumerNumber(String consumerNumber) {
        this.consumerNumber = consumerNumber;
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

    public String getProviderReference() {
        return providerReference;
    }

    public void setProviderReference(String providerReference) {
        this.providerReference = providerReference;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}