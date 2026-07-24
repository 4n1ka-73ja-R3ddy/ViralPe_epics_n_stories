package com.viralpe.royalty.dto;

import java.math.BigDecimal;
import java.util.List;

public class VendorRoyaltyHistoryResponse {

    private BigDecimal totalRoyaltyEarned;

    private List<VendorRoyaltyHistoryItemResponse> history;

    public VendorRoyaltyHistoryResponse() {
    }

    public BigDecimal getTotalRoyaltyEarned() {
        return totalRoyaltyEarned;
    }

    public void setTotalRoyaltyEarned(BigDecimal totalRoyaltyEarned) {
        this.totalRoyaltyEarned = totalRoyaltyEarned;
    }

    public List<VendorRoyaltyHistoryItemResponse> getHistory() {
        return history;
    }

    public void setHistory(List<VendorRoyaltyHistoryItemResponse> history) {
        this.history = history;
    }
}