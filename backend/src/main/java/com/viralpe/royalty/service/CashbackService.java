package com.viralpe.royalty.service;

import com.viralpe.royalty.dto.CashbackHistoryItemResponse;
import com.viralpe.royalty.dto.CashbackHistoryResponse;
import com.viralpe.royalty.model.CashbackLedger;
import com.viralpe.royalty.model.PincodePool;
import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.repository.CashbackLedgerRepository;
import com.viralpe.royalty.repository.PincodePoolRepository;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CashbackService {

    private final RoyaltyConfigurationRepository royaltyConfigRepo;
    private final WalletService walletService;
    private final UserRepository userRepository;
    private final PincodePoolRepository pincodePoolRepository;
    private final CashbackLedgerRepository cashbackLedgerRepository;

    public CashbackService(
            RoyaltyConfigurationRepository royaltyConfigRepo,
            WalletService walletService,
            UserRepository userRepository,
            PincodePoolRepository pincodePoolRepository,
            CashbackLedgerRepository cashbackLedgerRepository
    ) {
        this.royaltyConfigRepo = royaltyConfigRepo;
        this.walletService = walletService;
        this.userRepository = userRepository;
        this.pincodePoolRepository = pincodePoolRepository;
        this.cashbackLedgerRepository = cashbackLedgerRepository;
    }

    @Transactional
    public void applyCashback(
            Long userId,
            Long sourceTransactionId,
            String transactionType,
            Double grossPaid,
            Double apiCost
    ) {

        if (userId == null ||
                grossPaid == null ||
                apiCost == null ||
                grossPaid <= 0) {
            return;
        }

        RoyaltyConfiguration cfg =
                royaltyConfigRepo.findAll()
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

        double pincodeDeductionFraction =
                cfg.getPincodeDeductionFraction() == null
                        ? (cfg.getPincodePercentage() == null
                                ? 0.0
                                : cfg.getPincodePercentage())
                        : cfg.getPincodeDeductionFraction();

        double profitMargin = grossPaid - apiCost;

        if (profitMargin <= 0) {
            return;
        }

        double grossCashback =
                profitMargin * cashbackPercentage / 100.0;

        double pincodeDeduction =
                grossCashback * pincodeDeductionFraction;

        double netCashback =
                grossCashback - pincodeDeduction;

        if (netCashback > 0) {
            walletService.creditWalletBalance(
                    userId,
                    netCashback,
                    "cashback",
                    String.valueOf(sourceTransactionId)
            );
        }

        User user =
                userRepository.findById(userId)
                        .orElse(null);

        if (user != null &&
                user.getRegisteredPincode() != null &&
                pincodeDeduction > 0) {

            String pincode =
                    user.getRegisteredPincode();

            PincodePool pool =
                    pincodePoolRepository
                            .findByPincode(pincode)
                            .orElseGet(() -> {
                                PincodePool newPool =
                                        new PincodePool();
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

        CashbackLedger ledger =
                new CashbackLedger();

        ledger.setUserId(userId);
        ledger.setSourceTransactionId(sourceTransactionId);
        ledger.setTransactionType(transactionType);
        ledger.setGrossCashback(grossCashback);
        ledger.setPincodeDeduction(pincodeDeduction);
        ledger.setNetCashback(netCashback);
        ledger.setCashbackPercentage(cashbackPercentage);
        ledger.setPincodePercentage(pincodeDeductionFraction);
        ledger.setCreatedAt(OffsetDateTime.now());

        cashbackLedgerRepository.save(ledger);
    }

    public CashbackHistoryResponse getHistory(
            Long userId) {

        List<CashbackLedger> ledgers =
                cashbackLedgerRepository
                        .findByUserIdOrderByCreatedAtDesc(userId);

        return buildResponse(userId, ledgers);
    }

    public CashbackHistoryResponse getHistory(
            Long userId,
            OffsetDateTime startDate,
            OffsetDateTime endDate) {

        List<CashbackLedger> ledgers =
                cashbackLedgerRepository
                        .findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                                userId,
                                startDate,
                                endDate
                        );

        return buildResponse(userId, ledgers);
    }

    private CashbackHistoryResponse buildResponse(
            Long userId,
            List<CashbackLedger> ledgers) {

        List<CashbackHistoryItemResponse> history =
                new ArrayList<>();

        double total = 0.0;

        for (CashbackLedger ledger : ledgers) {

            CashbackHistoryItemResponse item =
                    new CashbackHistoryItemResponse();

            item.setCashbackLedgerId(ledger.getId());
            item.setSourceTransactionId(
                    ledger.getSourceTransactionId());
            item.setTransactionType(
                    ledger.getTransactionType());
            item.setGrossCashback(
                    ledger.getGrossCashback());
            item.setPincodeDeduction(
                    ledger.getPincodeDeduction());
            item.setNetCashback(
                    ledger.getNetCashback());
            item.setCreatedAt(
                    ledger.getCreatedAt());

            total += ledger.getNetCashback();

            history.add(item);
        }

        CashbackHistoryResponse response =
                new CashbackHistoryResponse();

        response.setUserId(userId);
        response.setTotalCashback(total);
        response.setCashbackHistory(history);

        return response;
    }
}