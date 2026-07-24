package com.viralpe.vendor.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vendorName;

    private String businessName;

    private String businessPincode;

    private Long onboardedByUserId;

    private Boolean active = true;

    private OffsetDateTime createdAt;

    public Vendor() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessPincode() {
        return businessPincode;
    }

    public void setBusinessPincode(String businessPincode) {
        this.businessPincode = businessPincode;
    }

    public Long getOnboardedByUserId() {
        return onboardedByUserId;
    }

    public void setOnboardedByUserId(Long onboardedByUserId) {
        this.onboardedByUserId = onboardedByUserId;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}