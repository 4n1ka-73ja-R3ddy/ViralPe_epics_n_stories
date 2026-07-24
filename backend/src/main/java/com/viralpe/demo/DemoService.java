package com.viralpe.demo;

import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DemoService {

    private final WalletService walletService;

    public DemoService(WalletService walletService) {
        this.walletService = walletService;
    }

    @Transactional
    public void loadDemoData(Long userId) {
        walletService.creditWalletBalance(
                userId,
                2180.0,
                "CASHBACK",
                "DEMO-CASHBACK"
        );

        walletService.creditWalletBalance(
                userId,
                1250.0,
                "REFERRAL",
                "DEMO-REFERRAL"
        );

        walletService.creditWalletBalance(
                userId,
                4850.0,
                "VENDOR_ROYALTY",
                "DEMO-VENDOR-ROYALTY"
        );

        walletService.creditWalletBalance(
                userId,
                780.0,
                "PINCODE_ROYALTY",
                "DEMO-PINCODE-ROYALTY"
        );

        walletService.creditWalletBalance(
                userId,
                5390.0,
                "DEMO_WALLET_TOPUP",
                "DEMO-WALLET-TOPUP"
        );

        walletService.debitWalletBalance(
                userId,
                1200.0,
                "ELECTRICITY_BILL",
                "DEMO-ELECTRICITY"
        );

        walletService.debitWalletBalance(
                userId,
                299.0,
                "MOBILE_RECHARGE",
                "DEMO-MOBILE"
        );

        walletService.debitWalletBalance(
                userId,
                450.0,
                "WATER_BILL",
                "DEMO-WATER"
        );

        walletService.debitWalletBalance(
                userId,
                350.0,
                "GAS_BILL",
                "DEMO-GAS"
        );

        walletService.debitWalletBalance(
                userId,
                199.0,
                "DTH_RECHARGE",
                "DEMO-DTH"
        );

        ReversalWallet reversalWallet =
                walletService.creditReversalWallet(
                        userId,
                        350.0,
                        LocalDate.now().plusDays(1).toString()
                );
    }
}