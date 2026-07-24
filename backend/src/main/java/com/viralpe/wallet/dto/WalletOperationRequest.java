package com.viralpe.wallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class WalletOperationRequest {

    @NotNull(message = "User ID is required.")
    private Long userId;

    @NotNull(message = "Amount is required.")
    @DecimalMin(
            value = "0.01",
            inclusive = true,
            message = "Amount must be greater than 0."
    )
    private Double amount;

    @NotBlank(message = "Category is required.")
    private String category;

    private String sourceReference;
    private String expiresAt;

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSourceReference() {
        return sourceReference;
    }

    public void setSourceReference(String sourceReference) {
        this.sourceReference = sourceReference;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }
}