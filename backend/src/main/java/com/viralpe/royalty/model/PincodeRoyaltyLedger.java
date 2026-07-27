package com.viralpe.royalty.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "pincode_royalty_ledger")
public class PincodeRoyaltyLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 6)
    private String pincode;

    @Column(name = "winner_user_id")
    private Long winnerUserId;

    @Column(name = "source_transaction_id")
    private Long sourceTransactionId;

    @Column(name = "pool_amount")
    private Double poolAmount;

    @Column(name = "cycle_end_at")
    private OffsetDateTime cycleEndAt;

    @Column(name = "created_at")
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
