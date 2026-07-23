package com.viralpe.auth.dto;

public class AuthResponse {

    private Long userId;
    private String token;
    private Boolean profileComplete;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(Long userId, String token, Boolean profileComplete, String message) {
        this.userId = userId;
        this.token = token;
        this.profileComplete = profileComplete;
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
// developed by anika teja reddy
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Boolean getProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(Boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
