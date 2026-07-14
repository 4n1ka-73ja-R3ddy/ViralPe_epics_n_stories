package com.viralpe.transaction.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String vendorCode;
    private String onboardedPincode;
    private Double royaltyPercentage;
    private Boolean active = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVendorCode() {
        return vendorCode;
    }

    public void setVendorCode(String vendorCode) {
        this.vendorCode = vendorCode;
    }

    public String getOnboardedPincode() {
        return onboardedPincode;
    }

    public void setOnboardedPincode(String onboardedPincode) {
        this.onboardedPincode = onboardedPincode;
    }

    public Double getRoyaltyPercentage() {
        return royaltyPercentage;
    }

    public void setRoyaltyPercentage(Double royaltyPercentage) {
        this.royaltyPercentage = royaltyPercentage;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
