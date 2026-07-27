package com.viralpe.royalty.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "pincode_pool")
public class PincodePool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String pincode;

    @Column(name = "pool_balance")
    private Double poolBalance;

    @Column(name = "current_cycle_pool")
    private Double currentCyclePool;

    @Column(name = "last_cycle_winner_user_id")
    private Long lastCycleWinnerUserId;

    @Column(name = "last_cycle_total_payout")
    private Double lastCycleTotalPayout;

    @Column(name = "cycle_started_at")
    private OffsetDateTime cycleStartedAt;

    @Column(name = "last_cycle_ended_at")
    private OffsetDateTime lastCycleEndedAt;

    @Column(name = "active")
    private Boolean active = true;

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

    public Double getPoolBalance() {
        return poolBalance;
    }

    public void setPoolBalance(Double poolBalance) {
        this.poolBalance = poolBalance;
    }

    public Double getCurrentCyclePool() {
        return currentCyclePool;
    }

    public void setCurrentCyclePool(Double currentCyclePool) {
        this.currentCyclePool = currentCyclePool;
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

    public OffsetDateTime getCycleStartedAt() {
        return cycleStartedAt;
    }

    public void setCycleStartedAt(OffsetDateTime cycleStartedAt) {
        this.cycleStartedAt = cycleStartedAt;
    }

    public OffsetDateTime getLastCycleEndedAt() {
        return lastCycleEndedAt;
    }

    public void setLastCycleEndedAt(OffsetDateTime lastCycleEndedAt) {
        this.lastCycleEndedAt = lastCycleEndedAt;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}

