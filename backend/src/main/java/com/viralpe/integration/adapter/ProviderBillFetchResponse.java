package com.viralpe.integration.adapter;

import java.math.BigDecimal;

public class ProviderBillFetchResponse {
    private boolean success;
    private String providerId;
    private String billerName;
    private String customerName;
    private BigDecimal amountDue;
    private String dueDate;
    private String billNumber;
    private String rawProviderRef;
    private NormalizedProviderError error;

    public ProviderBillFetchResponse() {}

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getBillerName() {
        return billerName;
    }

    public void setBillerName(String billerName) {
        this.billerName = billerName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getAmountDue() {
        return amountDue;
    }

    public void setAmountDue(BigDecimal amountDue) {
        this.amountDue = amountDue;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public String getRawProviderRef() {
        return rawProviderRef;
    }

    public void setRawProviderRef(String rawProviderRef) {
        this.rawProviderRef = rawProviderRef;
    }

    public NormalizedProviderError getError() {
        return error;
    }

    public void setError(NormalizedProviderError error) {
        this.error = error;
    }
}
