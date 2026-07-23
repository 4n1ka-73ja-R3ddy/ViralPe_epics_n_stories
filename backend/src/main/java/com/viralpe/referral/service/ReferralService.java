package com.viralpe.referral.service;

import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;

@Service
public class ReferralService {

    private final WalletService walletService;

// developed by anika teja reddy
    public ReferralService(WalletService walletService) {
        this.walletService = walletService;
    }

    // Credit referral bonus to referrer
    public void creditReferral(Long referrerUserId, Double bonusAmount) {
        if (bonusAmount == null || bonusAmount <= 0) return;
        walletService.creditWalletBalance(referrerUserId, bonusAmount, "referral_bonus", "referral");
    }
}
