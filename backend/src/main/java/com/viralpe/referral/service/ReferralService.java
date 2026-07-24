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

    public void calculateAndCreditReferral(
            Long referrerUserId,
            Long referredUserId,
            Long sourceTransactionId,
            Double grossPaid,
            Double apiCost
    ) {
        if (referrerUserId == null || grossPaid == null || grossPaid <= 0) {
            return;
        }

        double profitMargin = grossPaid - (apiCost == null ? 0.0 : apiCost);
        if (profitMargin <= 0) {
            return;
        }

        double bonusAmount = profitMargin * 0.01;
        if (bonusAmount > 0) {
            walletService.creditWalletBalance(
                    referrerUserId,
                    bonusAmount,
                    "REFERRAL",
                    String.valueOf(sourceTransactionId)
            );
        }
    }
}
