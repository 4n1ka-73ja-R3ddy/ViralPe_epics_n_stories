package com.viralpe.voucher.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "voucher_purchase")
public class VoucherPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private Double denomination;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String voucherCode;

    @Column(nullable = false)
    private String voucherPin;

    @Column(nullable = false)
    private String status;

    private String providerReference;

    private Long checkoutTransactionId;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    public VoucherPurchase() {
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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
// developed by anika teja reddy
    }

    public Double getDenomination() {
        return denomination;
    }

    public void setDenomination(Double denomination) {
        this.denomination = denomination;
    }

    public Double getAmount() {
        return amount;
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

    public Long getCheckoutTransactionId() {
        return checkoutTransactionId;
    }

    public void setCheckoutTransactionId(Long checkoutTransactionId) {
        this.checkoutTransactionId = checkoutTransactionId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}