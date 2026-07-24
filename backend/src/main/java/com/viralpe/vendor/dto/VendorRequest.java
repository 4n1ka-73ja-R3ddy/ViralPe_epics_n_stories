package com.viralpe.vendor.dto;

public class VendorRequest {

    private String vendorName;

    private String businessName;

    private String businessPincode;

    private Long onboardedByUserId;

    public VendorRequest() {
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
}