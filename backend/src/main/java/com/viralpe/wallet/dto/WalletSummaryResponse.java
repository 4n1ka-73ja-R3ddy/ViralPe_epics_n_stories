package com.viralpe.wallet.dto;

public class WalletSummaryResponse {

    private Double walletBalance;
    private Double reversalBalance;

    private Double cashback;
    private Double referral;
    private Double vendorRoyalty;
    private Double pincodeRoyalty;

    private Double totalEarnings;

    public Double getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(Double walletBalance) {
        this.walletBalance = walletBalance;
    }

    public Double getReversalBalance() {
        return reversalBalance;
    }

    public void setReversalBalance(Double reversalBalance) {
        this.reversalBalance = reversalBalance;
    }

    public Double getCashback() {
        return cashback;
    }

    public void setCashback(Double cashback) {
        this.cashback = cashback;
    }

    public Double getReferral() {
        return referral;
    }

    public void setReferral(Double referral) {
        this.referral = referral;
    }

    public Double getVendorRoyalty() {
        return vendorRoyalty;
    }

    public void setVendorRoyalty(Double vendorRoyalty) {
        this.vendorRoyalty = vendorRoyalty;
    }

    public Double getPincodeRoyalty() {
        return pincodeRoyalty;
    }

    public void setPincodeRoyalty(Double pincodeRoyalty) {
        this.pincodeRoyalty = pincodeRoyalty;
    }

    public Double getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(Double totalEarnings) {
        this.totalEarnings = totalEarnings;
    }
}