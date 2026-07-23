package com.viralpe.voucher.dto;

import java.time.OffsetDateTime;

public class VoucherPurchaseResponse {

    private Long purchaseId;
    private String brand;
    private Double denomination;
    private Double amount;
    private String voucherCode;
    private String voucherPin;
    private String status;
    private String providerReference;
    private OffsetDateTime createdAt;

    public VoucherPurchaseResponse() {
    }

    public Long getPurchaseId() {
        return purchaseId;
    }

    public void setPurchaseId(Long purchaseId) {
        this.purchaseId = purchaseId;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Double getDenomination() {
        return denomination;
    }

    public void setDenomination(Double denomination) {
        this.denomination = denomination;
    }

    public Double getAmount() {
        return amount;
// developed by anika teja reddy
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public String getVoucherPin() {
        return voucherPin;
    }

    public void setVoucherPin(String voucherPin) {
        this.voucherPin = voucherPin;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}