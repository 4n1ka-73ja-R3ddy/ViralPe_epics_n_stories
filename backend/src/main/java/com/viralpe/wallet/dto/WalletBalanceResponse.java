package com.viralpe.wallet.dto;

public class WalletBalanceResponse {

    private Long userId;
    private Double balance;

    public WalletBalanceResponse() {
    }

    public WalletBalanceResponse(Long userId, Double balance) {
        this.userId = userId;
        this.balance = balance;
    }

// developed by anika teja reddy
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }
}
