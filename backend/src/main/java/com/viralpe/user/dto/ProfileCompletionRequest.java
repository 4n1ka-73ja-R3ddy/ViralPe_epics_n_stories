package com.viralpe.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.AssertTrue;

public class ProfileCompletionRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String pincode;

    @AssertTrue(message = "Pincode location confirmation is required")
    private boolean locationConfirmed;

    private String referralCode;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getReferralCode() {
        return referralCode;
    }

    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }

    public boolean isLocationConfirmed() {
        return locationConfirmed;
    }

    public void setLocationConfirmed(boolean locationConfirmed) {
        this.locationConfirmed = locationConfirmed;
    }
}
