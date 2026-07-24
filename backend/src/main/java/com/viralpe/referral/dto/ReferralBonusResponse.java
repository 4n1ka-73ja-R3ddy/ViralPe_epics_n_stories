package com.viralpe.referral.dto;

import java.time.OffsetDateTime;

public class ReferralBonusResponse {

    private Long referralBonusId;
    private Long referrerUserId;
    private Long refereeUserId;
    private Long sourceTransactionId;
    private Double referralBonus;
    private Double profitMargin;
    private Double referralPercentage;
    private OffsetDateTime createdAt;

    public ReferralBonusResponse() {
    }

    public Long getReferralBonusId() {
        return referralBonusId;
    }

    public void setReferralBonusId(Long referralBonusId) {
        this.referralBonusId = referralBonusId;
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

    public Double getReferralBonus() {
        return referralBonus;
    }

    public void setReferralBonus(Double referralBonus) {
        this.referralBonus = referralBonus;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}