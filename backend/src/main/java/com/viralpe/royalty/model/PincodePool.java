package com.viralpe.royalty.model;

import jakarta.persistence.*;

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
}

