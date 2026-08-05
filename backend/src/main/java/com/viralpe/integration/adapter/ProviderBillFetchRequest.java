package com.viralpe.integration.adapter;

public class ProviderBillFetchRequest {
    private String category; // RECHARGE, UTILITY, VOUCHER
    private String billerCode;
    private String accountNumber;
    private String correlationId;

    public ProviderBillFetchRequest() {}

    public ProviderBillFetchRequest(String category, String billerCode, String accountNumber, String correlationId) {
        this.category = category;
        this.billerCode = billerCode;
        this.accountNumber = accountNumber;
        this.correlationId = correlationId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBillerCode() {
        return billerCode;
    }

    public void setBillerCode(String billerCode) {
        this.billerCode = billerCode;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
}
