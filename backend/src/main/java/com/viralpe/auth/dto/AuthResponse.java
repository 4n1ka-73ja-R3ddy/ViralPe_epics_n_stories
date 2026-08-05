package com.viralpe.auth.dto;

public class AuthResponse {

    private Long userId;
    private String token;
    private Boolean profileComplete;
    private String message;
    private String email;
    private String fullName;

    public AuthResponse() {
    }

    public AuthResponse(Long userId, String token, Boolean profileComplete, String message) {
        this.userId = userId;
        this.token = token;
        this.profileComplete = profileComplete;
        this.message = message;
    }

    public AuthResponse(Long userId, String token, Boolean profileComplete, String message, String email, String fullName) {
        this.userId = userId;
        this.token = token;
        this.profileComplete = profileComplete;
        this.message = message;
        this.email = email;
        this.fullName = fullName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
