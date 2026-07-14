package com.viralpe.payment.dto;

public class CheckoutResponse {
    private Long transactionId;
    private String status;
    private Double amountTakenFromWallet;
    private Double amountTakenFromGateway;

    public CheckoutResponse() {
    }

    public CheckoutResponse(Long transactionId, String status, Double amountTakenFromWallet, Double amountTakenFromGateway) {
        this.transactionId = transactionId;
        this.status = status;
        this.amountTakenFromWallet = amountTakenFromWallet;
        this.amountTakenFromGateway = amountTakenFromGateway;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getAmountTakenFromWallet() {
        return amountTakenFromWallet;
    }

    public void setAmountTakenFromWallet(Double amountTakenFromWallet) {
        this.amountTakenFromWallet = amountTakenFromWallet;
    }

    public Double getAmountTakenFromGateway() {
        return amountTakenFromGateway;
    }

    public void setAmountTakenFromGateway(Double amountTakenFromGateway) {
        this.amountTakenFromGateway = amountTakenFromGateway;
    }
}
