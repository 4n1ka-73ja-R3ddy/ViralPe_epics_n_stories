package com.viralpe.royalty.dto;

import java.util.List;

public class CashbackHistoryResponse {

    private Long userId;

    private Double totalCashback;

    private List<CashbackHistoryItemResponse> cashbackHistory;

    public CashbackHistoryResponse() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getTotalCashback() {
        return totalCashback;
    }

    public void setTotalCashback(Double totalCashback) {
        this.totalCashback = totalCashback;
    }

    public List<CashbackHistoryItemResponse> getCashbackHistory() {
        return cashbackHistory;
    }

    public void setCashbackHistory(List<CashbackHistoryItemResponse> cashbackHistory) {
        this.cashbackHistory = cashbackHistory;
    }
}
