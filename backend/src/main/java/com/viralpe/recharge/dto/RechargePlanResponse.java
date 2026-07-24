package com.viralpe.recharge.dto;

public class RechargePlanResponse {

    private Long id;
    private String operatorCode;
    private String circle;
    private Double amount;
    private String validity;
    private String description;

    public RechargePlanResponse(
            Long id,
            String operatorCode,
            String circle,
            Double amount,
            String validity,
            String description
    ) {
        this.id = id;
        this.operatorCode = operatorCode;
        this.circle = circle;
        this.amount = amount;
        this.validity = validity;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getOperatorCode() {
        return operatorCode;
    }

    public String getCircle() {
        return circle;
    }

    public Double getAmount() {
        return amount;
    }

    public String getValidity() {
        return validity;
    }

    public String getDescription() {
        return description;
    }
}