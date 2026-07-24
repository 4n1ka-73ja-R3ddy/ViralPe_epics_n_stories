package com.viralpe.referral.dto;

import java.util.List;

public class ReferralEarningsHistoryResponse {

    private Long referrerUserId;
    private Double totalReferralEarnings;
    private List<ReferralBonusResponse> earnings;

    public ReferralEarningsHistoryResponse() {
    }

    public Long getReferrerUserId() {
        return referrerUserId;
    }

    public void setReferrerUserId(Long referrerUserId) {
        this.referrerUserId = referrerUserId;
    }

    public Double getTotalReferralEarnings() {
        return totalReferralEarnings;
    }

    public void setTotalReferralEarnings(Double totalReferralEarnings) {
        this.totalReferralEarnings = totalReferralEarnings;
    }

    public List<ReferralBonusResponse> getEarnings() {
        return earnings;
    }

    public void setEarnings(List<ReferralBonusResponse> earnings) {
        this.earnings = earnings;
    }
}