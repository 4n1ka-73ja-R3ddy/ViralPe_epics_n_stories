package com.viralpe.transaction.dto;

public class CheckoutPreviewResponse {

    private Double invoiceAmount;
    private Double availableReversalBalance;
    private Double reversalAmountApplied;
    private Double availableWalletBalance;
    private Double walletAmountApplied;
    private Double paymentGatewayAmount;

    public CheckoutPreviewResponse(
            Double invoiceAmount,
            Double availableReversalBalance,
            Double reversalAmountApplied,
            Double availableWalletBalance,
            Double walletAmountApplied,
            Double paymentGatewayAmount
    ) {
        this.invoiceAmount = invoiceAmount;
        this.availableReversalBalance = availableReversalBalance;
        this.reversalAmountApplied = reversalAmountApplied;
        this.availableWalletBalance = availableWalletBalance;
        this.walletAmountApplied = walletAmountApplied;
        this.paymentGatewayAmount = paymentGatewayAmount;
    }

    public Double getInvoiceAmount() {
        return invoiceAmount;
    }

    public Double getAvailableReversalBalance() {
        return availableReversalBalance;
    }

    public Double getReversalAmountApplied() {
        return reversalAmountApplied;
    }

    public Double getAvailableWalletBalance() {
        return availableWalletBalance;
    }

    public Double getWalletAmountApplied() {
        return walletAmountApplied;
    }

    public Double getPaymentGatewayAmount() {
        return paymentGatewayAmount;
    }
}