package com.viralpe.royalty.dto;

import java.time.OffsetDateTime;

public class PincodeChampionshipHistoryEntryResponse {

    private Long id;
    private String pincode;
    private Long winnerUserId;
    private Long sourceTransactionId;
    private Double poolAmount;
    private OffsetDateTime cycleEndAt;
    private OffsetDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Long getWinnerUserId() {
        return winnerUserId;
    }

    public void setWinnerUserId(Long winnerUserId) {
        this.winnerUserId = winnerUserId;
    }

    public Long getSourceTransactionId() {
        return sourceTransactionId;
    }

    public void setSourceTransactionId(Long sourceTransactionId) {
        this.sourceTransactionId = sourceTransactionId;
    }

    public Double getPoolAmount() {
        return poolAmount;
    }

    public void setPoolAmount(Double poolAmount) {
        this.poolAmount = poolAmount;
    }

    public OffsetDateTime getCycleEndAt() {
        return cycleEndAt;
    }

    public void setCycleEndAt(OffsetDateTime cycleEndAt) {
        this.cycleEndAt = cycleEndAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
