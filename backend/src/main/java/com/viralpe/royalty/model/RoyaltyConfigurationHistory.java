package com.viralpe.royalty.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "royalty_configuration_history")
public class RoyaltyConfigurationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;

    private Double cashbackPercentage;

    private Double referralPercentage;

    private Double vendorRoyaltyPercentage;

    private Double profitMarginPercentage;

    private Double verticalRoyaltyPercentage;

    private Double pincodeCashbackFraction;

    private Double pincodeVendorFraction;

    private OffsetDateTime effectiveFrom;

    private OffsetDateTime createdAt;

    private Long adminUserId;

    private String changeReason;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public Double getVerticalRoyaltyPercentage() {
        return verticalRoyaltyPercentage;
    }

    public void setVerticalRoyaltyPercentage(Double verticalRoyaltyPercentage) {
        this.verticalRoyaltyPercentage = verticalRoyaltyPercentage;
    }

    public Double getPincodeCashbackFraction() {
        return pincodeCashbackFraction;
    }

    public void setPincodeCashbackFraction(Double pincodeCashbackFraction) {
        this.pincodeCashbackFraction = pincodeCashbackFraction;
    }

    public Double getPincodeVendorFraction() {
        return pincodeVendorFraction;
    }

    public void setPincodeVendorFraction(Double pincodeVendorFraction) {
        this.pincodeVendorFraction = pincodeVendorFraction;
    }

    public OffsetDateTime getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(OffsetDateTime effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getAdminUserId() {
        return adminUserId;
    }

    public void setAdminUserId(Long adminUserId) {
        this.adminUserId = adminUserId;
    }

    public String getChangeReason() {
        return changeReason;
    }

    public void setChangeReason(String changeReason) {
        this.changeReason = changeReason;
    }
}
