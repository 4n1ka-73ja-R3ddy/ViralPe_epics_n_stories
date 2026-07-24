package com.viralpe.royalty.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "royalty_configuration")
public class RoyaltyConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double cashbackPercentage;

    private Double referralPercentage;

    /**
     * Percentage of profit shared with vendor.
     */
    private Double vendorRoyaltyPercentage;

    /**
     * Profit margin percentage on every transaction.
     * Example:
     * Amount = 100
     * Profit Margin = 20%
     * Profit = 20
     */
    private Double profitMarginPercentage;

    private Double pincodeDeductionFraction;

    private Double pincodePercentage;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getCashbackPercentage() {
        return cashbackPercentage;
    }

    public void setCashbackPercentage(Double cashbackPercentage) {
        this.cashbackPercentage = cashbackPercentage;
    }

    public Double getReferralPercentage() {
        return referralPercentage;
    }

    public void setReferralPercentage(Double referralPercentage) {
        this.referralPercentage = referralPercentage;
    }

    public Double getVendorRoyaltyPercentage() {
        return vendorRoyaltyPercentage;
    }

    public void setVendorRoyaltyPercentage(Double vendorRoyaltyPercentage) {
        this.vendorRoyaltyPercentage = vendorRoyaltyPercentage;
    }

    public Double getProfitMarginPercentage() {
        return profitMarginPercentage;
    }

    public void setProfitMarginPercentage(Double profitMarginPercentage) {
        this.profitMarginPercentage = profitMarginPercentage;
    }

    public Double getPincodeDeductionFraction() {
        return pincodeDeductionFraction;
    }

    public void setPincodeDeductionFraction(Double pincodeDeductionFraction) {
        this.pincodeDeductionFraction = pincodeDeductionFraction;
    }

    public Double getPincodePercentage() {
        return pincodePercentage;
    }

    public void setPincodePercentage(Double pincodePercentage) {
        this.pincodePercentage = pincodePercentage;
    }
}