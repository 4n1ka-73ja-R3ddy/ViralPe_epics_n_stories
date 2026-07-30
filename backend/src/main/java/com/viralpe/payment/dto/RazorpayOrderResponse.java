package com.viralpe.payment.dto;

public class RazorpayOrderResponse {
    private String orderId;
    private String keyId;
    private Long amountInPaise;
    private Double amountInRupees;
    private String currency;
    private String status;

    public RazorpayOrderResponse() {}

    public RazorpayOrderResponse(String orderId, String keyId, Long amountInPaise, Double amountInRupees, String currency, String status) {
        this.orderId = orderId;
        this.keyId = keyId;
        this.amountInPaise = amountInPaise;
        this.amountInRupees = amountInRupees;
        this.currency = currency;
        this.status = status;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public Long getAmountInPaise() {
        return amountInPaise;
    }

    public void setAmountInPaise(Long amountInPaise) {
        this.amountInPaise = amountInPaise;
    }

    public Double getAmountInRupees() {
        return amountInRupees;
    }

    public void setAmountInRupees(Double amountInRupees) {
        this.amountInRupees = amountInRupees;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
