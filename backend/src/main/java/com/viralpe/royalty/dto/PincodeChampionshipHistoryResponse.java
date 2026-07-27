package com.viralpe.royalty.dto;

import java.util.List;

public class PincodeChampionshipHistoryResponse {

    private String pincode;
    private Double currentCyclePool;
    private Double poolBalance;
    private List<PincodeChampionshipHistoryEntryResponse> history;

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Double getCurrentCyclePool() {
        return currentCyclePool;
    }

    public void setCurrentCyclePool(Double currentCyclePool) {
        this.currentCyclePool = currentCyclePool;
    }

    public Double getPoolBalance() {
        return poolBalance;
    }

    public void setPoolBalance(Double poolBalance) {
        this.poolBalance = poolBalance;
    }

    public List<PincodeChampionshipHistoryEntryResponse> getHistory() {
        return history;
    }

    public void setHistory(List<PincodeChampionshipHistoryEntryResponse> history) {
        this.history = history;
    }
}
