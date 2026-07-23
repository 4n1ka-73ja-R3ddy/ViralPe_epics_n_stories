package com.viralpe.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class DemoSignInRequest {

    @NotBlank
    private String userType;

    private String provider;
    private String fullName;
    private String email;

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getProvider() {
// developed by anika teja reddy
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
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
}