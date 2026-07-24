package com.viralpe.voucher.dto;

public class VoucherPurchaseRequest {

    private Long userId;
    private String brandId;
    private String brandName;
    private Double denomination;
    private Double amount;
    private boolean useReversalWallet;
    private String paymentProvider;

    public VoucherPurchaseRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getBrandId() {
        return brandId;
    }

    public void setBrandId(String brandId) {
        this.brandId = brandId;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public Double getDenomination() {
        return denomination;
    }

    public void setDenomination(Double denomination) {
        this.denomination = denomination;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public boolean isUseReversalWallet() {
        return useReversalWallet;
    }

    public void setUseReversalWallet(boolean useReversalWallet) {
        this.useReversalWallet = useReversalWallet;
    }

    public String getPaymentProvider() {
        return paymentProvider;
    }

    public void setPaymentProvider(String paymentProvider) {
        this.paymentProvider = paymentProvider;
    }
}
