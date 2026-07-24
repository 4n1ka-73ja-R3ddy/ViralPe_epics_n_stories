package com.viralpe.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CheckoutRequest {

    @NotNull
    private Long userId;

    @NotNull
    @Positive
    private Double amount;

    /**
     * Vendor selected for this checkout.
     */
    @NotNull
    private Long vendorId;

    /**
     * UPI / CARD / NETBANKING
     */
    private String provider;

    private boolean useReversalWallet = true;

    public CheckoutRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isUseReversalWallet() {
        return useReversalWallet;
    }

    public void setUseReversalWallet(boolean useReversalWallet) {
        this.useReversalWallet = useReversalWallet;
    }
}