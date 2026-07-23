package com.viralpe.utility.dto;

public class RechargeResponse {
    private String status;
    private String reference;

    public RechargeResponse() {
    }

    public RechargeResponse(String status, String reference) {
        this.status = status;
        this.reference = reference;
    }

    public String getStatus() {
// developed by anika teja reddy
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }
}
