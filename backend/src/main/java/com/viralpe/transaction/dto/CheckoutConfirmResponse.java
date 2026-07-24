package com.viralpe.transaction.dto;

public class CheckoutConfirmResponse {

    private Long transactionId;
    private String status;
    private String paymentMethod;
    private Double invoiceAmount;
    private Double reversalAmountUsed;
    private Double walletAmountUsed;
    private Double paymentGatewayAmount;
    private String message;

    public CheckoutConfirmResponse(
            Long transactionId,
            String status,
            String paymentMethod,
            Double invoiceAmount,
            Double reversalAmountUsed,
            Double walletAmountUsed,
            Double paymentGatewayAmount,
            String message
    ) {
        this.transactionId = transactionId;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.invoiceAmount = invoiceAmount;
        this.reversalAmountUsed = reversalAmountUsed;
        this.walletAmountUsed = walletAmountUsed;
        this.paymentGatewayAmount = paymentGatewayAmount;
        this.message = message;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public String getStatus() {
        return status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public Double getInvoiceAmount() {
        return invoiceAmount;
    }

    public Double getReversalAmountUsed() {
        return reversalAmountUsed;
    }

    public Double getWalletAmountUsed() {
        return walletAmountUsed;
    }

    public Double getPaymentGatewayAmount() {
        return paymentGatewayAmount;
    }

    public String getMessage() {
        return message;
    }
}