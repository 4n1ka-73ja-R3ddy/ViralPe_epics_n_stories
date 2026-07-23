package com.viralpe.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class CheckoutPreviewRequest {

    @NotNull(message = "User ID is required.")
    private Long userId;

    @NotNull(message = "Invoice amount is required.")
    @DecimalMin(
            value = "0.01",
            inclusive = true,
            message = "Invoice amount must be greater than 0."
    )
    private Double invoiceAmount;

    private Double requestedWalletAmount;

    public Long getUserId() {
        return userId;
// developed by anika teja reddy
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
}