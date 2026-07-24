package com.viralpe.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CheckoutConfirmRequest {

    @NotNull(message = "User ID is required.")
    private Long userId;

    @NotNull(message = "Invoice amount is required.")
    @DecimalMin(
            value = "0.01",
            inclusive = true,
            message = "Invoice amount must be greater than 0."
    )
    private Double invoiceAmount;

    @NotNull(message = "Wallet amount is required.")
    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Wallet amount cannot be negative."
    )
    private Double requestedWalletAmount;

    @NotBlank(message = "Payment method is required.")
    private String paymentMethod;

    @NotBlank(message = "Gateway result is required.")
    private String gatewayResult;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getInvoiceAmount() {
        return invoiceAmount;
    }

    public void setInvoiceAmount(Double invoiceAmount) {
        this.invoiceAmount = invoiceAmount;
    }

    public Double getRequestedWalletAmount() {
        return requestedWalletAmount;
    }

    public void setRequestedWalletAmount(Double requestedWalletAmount) {
        this.requestedWalletAmount = requestedWalletAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getGatewayResult() {
        return gatewayResult;
    }

    public void setGatewayResult(String gatewayResult) {
        this.gatewayResult = gatewayResult;
    }
}