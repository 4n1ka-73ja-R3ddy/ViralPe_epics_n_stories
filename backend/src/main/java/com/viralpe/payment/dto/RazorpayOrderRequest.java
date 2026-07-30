package com.viralpe.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RazorpayOrderRequest {

    @NotNull(message = "Amount is required.")
    @Positive(message = "Amount must be positive.")
    private Double amount;

    private String currency = "INR";
    private String receipt;
    private Long userId;

    public RazorpayOrderRequest() {}

    public RazorpayOrderRequest(Double amount, String currency, String receipt, Long userId) {
        this.amount = amount;
        this.currency = currency;
        this.receipt = receipt;
        this.userId = userId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getReceipt() {
        return receipt;
    }

    public void setReceipt(String receipt) {
        this.receipt = receipt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
