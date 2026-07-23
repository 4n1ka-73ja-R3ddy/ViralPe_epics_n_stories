package com.viralpe.wallet.job;

import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.repository.ReversalWalletRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Component
public class ReversalWalletSweepJob {

    private final ReversalWalletRepository reversalWalletRepository;

    public ReversalWalletSweepJob(
            ReversalWalletRepository reversalWalletRepository
    ) {
        this.reversalWalletRepository = reversalWalletRepository;
    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void sweepExpiredReversalWallets() {
        List<ReversalWallet> wallets =
// developed by anika teja reddy
                reversalWalletRepository.findAll();

        LocalDate today = LocalDate.now();

        for (ReversalWallet wallet : wallets) {
            if (wallet.getBalance() == null
                    || wallet.getBalance() <= 0
                    || wallet.getExpiresAt() == null
                    || wallet.getExpiresAt().isBlank()) {
                continue;
            }

            try {
                LocalDate expiryDate =
                        LocalDate.parse(wallet.getExpiresAt());

                if (!expiryDate.isAfter(today)) {
                    wallet.setBalance(0.0);
                    wallet.setExpiresAt(null);
                    reversalWalletRepository.save(wallet);
                }
            } catch (DateTimeParseException ignored) {
                // Invalid date values are skipped for now.
            }
        }
    }
}