package com.viralpe.transaction.dto;

public class TransactionStatusResponse {
    private String message;

    public TransactionStatusResponse() {
    }

    public TransactionStatusResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
