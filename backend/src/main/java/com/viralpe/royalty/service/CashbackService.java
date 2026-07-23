package com.viralpe.royalty.service;

import com.viralpe.royalty.model.PincodePool;
import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.royalty.repository.PincodePoolRepository;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CashbackService {

    private final RoyaltyConfigurationRepository royaltyConfigRepo;
    private final WalletService walletService;
    private final UserRepository userRepository;
    private final PincodePoolRepository pincodePoolRepository;

    public CashbackService(
            RoyaltyConfigurationRepository royaltyConfigRepo,
            WalletService walletService,
            UserRepository userRepository,
            PincodePoolRepository pincodePoolRepository
    ) {
        this.royaltyConfigRepo = royaltyConfigRepo;
        this.walletService = walletService;
        this.userRepository = userRepository;
        this.pincodePoolRepository = pincodePoolRepository;
    }

    @Transactional
    public void applyCashback(Long userId, Double txnAmount) {

        if (userId == null || txnAmount == null || txnAmount <= 0) {
            return;
        }

        RoyaltyConfiguration cfg = royaltyConfigRepo
                .findAll()
                .stream()
                .findFirst()
                .orElse(null);

        if (cfg == null) {
            return;
        }

        double cashbackPercentage =
                cfg.getCashbackPercentage() == null
                        ? 0.0
                        : cfg.getCashbackPercentage();
// developed by anika teja reddy

        double pincodePercentage =
                cfg.getPincodePercentage() == null
                        ? 0.0
                        : cfg.getPincodePercentage();

        double cashback =
                txnAmount * cashbackPercentage / 100.0;

        double pincodeDeduction =
                cashback * pincodePercentage;

        double netCashback =
                cashback - pincodeDeduction;

        if (netCashback > 0) {
            walletService.creditWalletBalance(
                    userId,
                    netCashback,
                    "cashback",
                    "txn_cashback"
            );
        }

        User user = userRepository
                .findById(userId)
                .orElse(null);

        if (user != null && user.getRegisteredPincode() != null) {

            String pincode = user.getRegisteredPincode();

            PincodePool pool = pincodePoolRepository
                    .findByPincode(pincode)
                    .orElseGet(() -> {
                        PincodePool newPool = new PincodePool();
                        newPool.setPincode(pincode);
                        newPool.setPoolBalance(0.0);
                        return newPool;
                    });

            double currentBalance =
                    pool.getPoolBalance() == null
                            ? 0.0
                            : pool.getPoolBalance();

            pool.setPoolBalance(
                    currentBalance + pincodeDeduction
            );

            pincodePoolRepository.save(pool);
        }
    }
}