package com.viralpe.referral.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "referral_bonus")
public class ReferralBonus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long referrerUserId;

    private Long refereeUserId;

    private Long sourceTransactionId;

    private Double transactionAmount;

    private Double apiCost;

    private Double profitMargin;

    private Double referralPercentage;

    private Double referralBonus;

    private OffsetDateTime createdAt;

    public ReferralBonus() {
    }

    public Long getId() {
        return id;
    }

    public Long getReferrerUserId() {
        return referrerUserId;
    }

    public void setReferrerUserId(Long referrerUserId) {
        this.referrerUserId = referrerUserId;
    }

    public Long getRefereeUserId() {
        return refereeUserId;
    }

    public void setRefereeUserId(Long refereeUserId) {
        this.refereeUserId = refereeUserId;
    }

    public Long getSourceTransactionId() {
        return sourceTransactionId;
    }

    public void setSourceTransactionId(Long sourceTransactionId) {
        this.sourceTransactionId = sourceTransactionId;
    }

    public Double getTransactionAmount() {
        return transactionAmount;
    }

    public void setTransactionAmount(Double transactionAmount) {
        this.transactionAmount = transactionAmount;
    }

    public Double getApiCost() {
        return apiCost;
    }

    public void setApiCost(Double apiCost) {
        this.apiCost = apiCost;
    }

    public Double getProfitMargin() {
        return profitMargin;
    }

    public void setProfitMargin(Double profitMargin) {
        this.profitMargin = profitMargin;
    }

    public Double getReferralPercentage() {
        return referralPercentage;
    }

    public void setReferralPercentage(Double referralPercentage) {
        this.referralPercentage = referralPercentage;
    }

    public Double getReferralBonus() {
        return referralBonus;
    }

    public void setReferralBonus(Double referralBonus) {
        this.referralBonus = referralBonus;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}