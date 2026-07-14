package com.viralpe.user.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String authProvider;
    private String authProviderId;
    private String fullName;
    private String email;
    private String registeredPincode;
    private Boolean profileComplete = false;
    private Long referredByUserId;
    private Long onboardedByUserId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public String getAuthProviderId() {
        return authProviderId;
    }

    public void setAuthProviderId(String authProviderId) {
        this.authProviderId = authProviderId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegisteredPincode() {
        return registeredPincode;
    }

    public void setRegisteredPincode(String registeredPincode) {
        this.registeredPincode = registeredPincode;
    }

    public Boolean getProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(Boolean profileComplete) {
        this.profileComplete = profileComplete;
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
