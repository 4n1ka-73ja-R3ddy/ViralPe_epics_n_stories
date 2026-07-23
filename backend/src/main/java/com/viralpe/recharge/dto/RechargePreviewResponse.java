package com.viralpe.recharge.dto;

public class RechargePreviewResponse {

    private Long userId;
    private String mobileNumber;
    private String operator;
    private String circle;
    private Long planId;
    private Double amount;
    private String validity;
    private String description;

    public RechargePreviewResponse() {
    }

    public RechargePreviewResponse(
            Long userId,
            String mobileNumber,
            String operator,
            String circle,
            Long planId,
            Double amount,
            String validity,
            String description
    ) {
        this.userId = userId;
        this.mobileNumber = mobileNumber;
        this.operator = operator;
        this.circle = circle;
        this.planId = planId;
        this.amount = amount;
        this.validity = validity;
        this.description = description;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
// developed by anika teja reddy
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getCircle() {
        return circle;
    }

    public void setCircle(String circle) {
        this.circle = circle;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getValidity() {
        return validity;
    }

    public void setValidity(String validity) {
        this.validity = validity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}