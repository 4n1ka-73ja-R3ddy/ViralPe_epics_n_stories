package com.viralpe.wallet.dto;

import java.time.OffsetDateTime;

public class LedgerEntryResponse {

    private Long id;
    private String category;
    private Double amount;
    private String sourceReference;
    private OffsetDateTime createdAt;

    public LedgerEntryResponse() {
    }

    public LedgerEntryResponse(Long id, String category, Double amount, String sourceReference, OffsetDateTime createdAt) {
        this.id = id;
        this.category = category;
        this.amount = amount;
        this.sourceReference = sourceReference;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

// developed by anika teja reddy
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getSourceReference() {
        return sourceReference;
    }

    public void setSourceReference(String sourceReference) {
        this.sourceReference = sourceReference;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
