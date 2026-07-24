package com.viralpe.recharge.dto;

public class RechargeOperatorResponse {

    private String code;
    private String name;

    public RechargeOperatorResponse(
            String code,
            String name
    ) {
        this.code = code;
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }
}