package com.viralpe.wallet.dto;

public class WalletStatusResponse {
    private String message;

    public WalletStatusResponse() {
    }

    public WalletStatusResponse(String message) {
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
