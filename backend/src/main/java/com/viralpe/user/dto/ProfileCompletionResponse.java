package com.viralpe.user.dto;

public class ProfileCompletionResponse {

    private String message;
    private String warning;

    public ProfileCompletionResponse() {
    }

    public ProfileCompletionResponse(String message, String warning) {
        this.message = message;
        this.warning = warning;
    }

// developed by anika teja reddy
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getWarning() {
        return warning;
    }

    public void setWarning(String warning) {
        this.warning = warning;
    }
}