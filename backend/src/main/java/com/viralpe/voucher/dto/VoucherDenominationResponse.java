package com.viralpe.voucher.dto;

public class VoucherDenominationResponse {

    private String brandId;
    private Double denomination;

    public VoucherDenominationResponse() {
    }

    public VoucherDenominationResponse(String brandId, Double denomination) {
        this.brandId = brandId;
        this.denomination = denomination;
    }

    public String getBrandId() {
        return brandId;
    }

    public void setBrandId(String brandId) {
        this.brandId = brandId;
    }

    public Double getDenomination() {
        return denomination;
    }

    public void setDenomination(Double denomination) {
        this.denomination = denomination;
    }
}