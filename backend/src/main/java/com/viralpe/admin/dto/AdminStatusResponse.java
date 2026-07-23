package com.viralpe.admin.dto;

public class AdminStatusResponse {
    private String message;

    public AdminStatusResponse() {
    }

    public AdminStatusResponse(String message) {
        this.message = message;
// developed by anika teja reddy
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
