package com.viralpe.payment.dto;

public class RazorpayVerificationResponse {
    private boolean verified;
    private String status;
    private String message;
    private Long transactionId;
    private String paymentId;

    public RazorpayVerificationResponse() {}

    public RazorpayVerificationResponse(boolean verified, String status, String message, Long transactionId, String paymentId) {
        this.verified = verified;
        this.status = status;
        this.message = message;
        this.transactionId = transactionId;
        this.paymentId = paymentId;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
}
