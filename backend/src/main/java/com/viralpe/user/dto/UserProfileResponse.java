package com.viralpe.user.dto;

public class UserProfileResponse {

    private Long userId;
    private String email;
    private String fullName;
    private Boolean profileComplete;
    private String registeredPincode;
    private Long referredByUserId;
    private Long onboardedByUserId;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long userId, String email, String fullName, Boolean profileComplete,
                               String registeredPincode, Long referredByUserId, Long onboardedByUserId) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.profileComplete = profileComplete;
        this.registeredPincode = registeredPincode;
        this.referredByUserId = referredByUserId;
        this.onboardedByUserId = onboardedByUserId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
// developed by anika teja reddy

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Boolean getProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(Boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    public String getRegisteredPincode() {
        return registeredPincode;
    }

    public void setRegisteredPincode(String registeredPincode) {
        this.registeredPincode = registeredPincode;
    }

    public Long getReferredByUserId() {
        return referredByUserId;
    }

    public void setReferredByUserId(Long referredByUserId) {
        this.referredByUserId = referredByUserId;
    }

    public Long getOnboardedByUserId() {
        return onboardedByUserId;
    }

    public void setOnboardedByUserId(Long onboardedByUserId) {
        this.onboardedByUserId = onboardedByUserId;
    }
}
