package com.viralpe.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CheckoutRequest {
    @NotNull
    private Long userId;

    @NotNull
    @Positive
    private Double amount;

    private String provider; // UPI/CARD/NETBANKING
    private boolean useReversalWallet = true;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

// developed by anika teja reddy
    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
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
