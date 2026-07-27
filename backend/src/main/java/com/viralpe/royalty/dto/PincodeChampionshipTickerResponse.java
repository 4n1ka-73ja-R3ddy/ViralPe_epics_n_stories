package com.viralpe.royalty.dto;

import java.time.OffsetDateTime;

public class PincodeChampionshipTickerResponse {

    private String pincode;
    private Double currentCyclePool;
    private Double poolBalance;
    private String phaseLabel;
    private OffsetDateTime nextEvaluationAt;
    private Long countdownSeconds;
    private Long lastCycleWinnerUserId;
    private Double lastCycleTotalPayout;
    private OffsetDateTime lastCycleEndedAt;

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

    public String getPhaseLabel() {
        return phaseLabel;
    }

    public void setPhaseLabel(String phaseLabel) {
        this.phaseLabel = phaseLabel;
    }

    public OffsetDateTime getNextEvaluationAt() {
        return nextEvaluationAt;
    }

    public void setNextEvaluationAt(OffsetDateTime nextEvaluationAt) {
        this.nextEvaluationAt = nextEvaluationAt;
    }

    public Long getCountdownSeconds() {
        return countdownSeconds;
    }

    public void setCountdownSeconds(Long countdownSeconds) {
        this.countdownSeconds = countdownSeconds;
    }

    public Long getLastCycleWinnerUserId() {
        return lastCycleWinnerUserId;
    }

    public void setLastCycleWinnerUserId(Long lastCycleWinnerUserId) {
        this.lastCycleWinnerUserId = lastCycleWinnerUserId;
    }

    public Double getLastCycleTotalPayout() {
        return lastCycleTotalPayout;
    }

    public void setLastCycleTotalPayout(Double lastCycleTotalPayout) {
        this.lastCycleTotalPayout = lastCycleTotalPayout;
    }

    public OffsetDateTime getLastCycleEndedAt() {
        return lastCycleEndedAt;
    }

    public void setLastCycleEndedAt(OffsetDateTime lastCycleEndedAt) {
        this.lastCycleEndedAt = lastCycleEndedAt;
    }
}
