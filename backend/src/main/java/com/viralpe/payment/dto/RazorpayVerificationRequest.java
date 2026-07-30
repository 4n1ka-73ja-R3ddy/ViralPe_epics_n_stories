package com.viralpe.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RazorpayVerificationRequest {

    @NotBlank(message = "Razorpay Order ID is required.")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay Payment ID is required.")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay Signature is required.")
    private String razorpaySignature;

    @NotNull(message = "User ID is required.")
    private Long userId;

    private Double amount;
    private Long vendorId;
    private String category;

    public RazorpayVerificationRequest() {}

    public RazorpayVerificationRequest(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, Long userId, Double amount) {
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.userId = userId;
        this.amount = amount;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
