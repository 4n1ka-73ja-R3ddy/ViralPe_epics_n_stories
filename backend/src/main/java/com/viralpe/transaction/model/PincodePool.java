package com.viralpe.transaction.model;

public class PincodePool {

    private Long id;
    private String pincode;
    private Double poolBalance;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}