package com.viralpe.wallet.service;

import com.viralpe.wallet.dto.WalletSummaryResponse;
import com.viralpe.wallet.model.LedgerEntry;
import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.repository.LedgerEntryRepository;
import com.viralpe.wallet.repository.ReversalWalletRepository;
import com.viralpe.wallet.repository.WalletBalanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class WalletService {

    private final WalletBalanceRepository walletBalanceRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final ReversalWalletRepository reversalWalletRepository;
    private final Map<Long, ReentrantLock> userLocks = new ConcurrentHashMap<>();

    public WalletService(
            WalletBalanceRepository walletBalanceRepository,
            LedgerEntryRepository ledgerEntryRepository,
            ReversalWalletRepository reversalWalletRepository
    ) {
        this.walletBalanceRepository = walletBalanceRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.reversalWalletRepository = reversalWalletRepository;
    }

    private ReentrantLock getUserLock(Long userId) {
        return userLocks.computeIfAbsent(userId, k -> new ReentrantLock());
    }

    public WalletBalance getWalletBalance(Long userId) {
        validateUserId(userId);

        return walletBalanceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    WalletBalance balance = new WalletBalance();
                    balance.setUserId(userId);
                    balance.setBalance(0.0);
                    return balance;
                });
    }

    @Transactional
    public WalletBalance creditWalletBalance(
            Long userId,
            Double amount,
            String category,
            String sourceReference
    ) {
        validateUserId(userId);
        validateAmount(amount, "Credit");
        validateCategory(category);

        ReentrantLock lock = getUserLock(userId);
        lock.lock();
        try {
            WalletBalance walletBalance =
                    walletBalanceRepository.findByUserId(userId)
                            .orElseGet(() -> {
                                WalletBalance newBalance = new WalletBalance();
                                newBalance.setUserId(userId);
                                newBalance.setBalance(0.0);
                                return newBalance;
                            });

            double currentBalance =
                    walletBalance.getBalance() == null
                            ? 0.0
                            : walletBalance.getBalance();

            walletBalance.setBalance(currentBalance + amount);

            WalletBalance savedBalance =
                    walletBalanceRepository.save(walletBalance);

            addLedgerEntry(
                    userId,
                    category.trim(),
                    amount,
                    normalizeSourceReference(sourceReference)
            );

            return savedBalance;
        } finally {
            lock.unlock();
        }
    }

    @Transactional
    public WalletBalance debitWalletBalance(
            Long userId,
            Double amount,
            String category,
            String sourceReference
    ) {
        validateUserId(userId);
        validateAmount(amount, "Debit");
        validateCategory(category);

        ReentrantLock lock = getUserLock(userId);
        lock.lock();
        try {
            WalletBalance walletBalance =
                    walletBalanceRepository.findByUserId(userId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Wallet balance not found for user."
                                    )
                            );

            double currentBalance =
                    walletBalance.getBalance() == null
                            ? 0.0
                            : walletBalance.getBalance();

            if (currentBalance < amount) {
                throw new IllegalArgumentException(
                        "Insufficient wallet balance."
                );
            }

            walletBalance.setBalance(currentBalance - amount);

            WalletBalance savedBalance =
                    walletBalanceRepository.save(walletBalance);

            addLedgerEntry(
                    userId,
                    category.trim(),
                    -amount,
                    normalizeSourceReference(sourceReference)
            );

            return savedBalance;
        } finally {
            lock.unlock();
        }
    }

    public List<LedgerEntry> getLedgerEntries(Long userId) {
        validateUserId(userId);

        return ledgerEntryRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<LedgerEntry> getEarningsLedger(Long userId) {
        validateUserId(userId);

        return ledgerEntryRepository
                .findByUserIdAndCategoryInOrderByCreatedAtDesc(
                        userId,
                        List.of(
                                "CASHBACK",
                                "REFERRAL",
                                "REFERRAL_BONUS",
                                "VENDOR_ROYALTY",
                                "PINCODE_ROYALTY",
                                "PINCODE_CHAMPIONSHIP"
                        )
                );
    }

    public List<com.viralpe.wallet.dto.WalletActivityEntryResponse> getConsolidatedWalletActivityLog(
            Long userId,
            String startDate,
            String endDate,
            String categoryFilter
    ) {
        validateUserId(userId);

        List<LedgerEntry> allEntries = ledgerEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        // Sort chronologically (earliest to latest) to compute running balances correctly
        List<LedgerEntry> chronological = allEntries.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return -1;
                    if (b.getCreatedAt() == null) return 1;
                    return a.getCreatedAt().compareTo(b.getCreatedAt());
                })
                .toList();

        List<com.viralpe.wallet.dto.WalletActivityEntryResponse> activityList = new java.util.ArrayList<>();
        double runningBalance = 0.0;

        for (LedgerEntry entry : chronological) {
            double amt = entry.getAmount() == null ? 0.0 : entry.getAmount();
            runningBalance += amt;

            com.viralpe.wallet.dto.WalletActivityEntryResponse res = new com.viralpe.wallet.dto.WalletActivityEntryResponse();
            res.setId(entry.getId());
            res.setUserId(entry.getUserId());
            res.setCategory(entry.getCategory());
            res.setAmount(amt);
            res.setSourceReference(entry.getSourceReference());
            res.setCreatedAt(entry.getCreatedAt());
            res.setRunningBalance(runningBalance);

            activityList.add(res);
        }

        // Apply filters
        java.time.LocalDate start = StringUtils.hasText(startDate) ? java.time.LocalDate.parse(startDate) : null;
        java.time.LocalDate end = StringUtils.hasText(endDate) ? java.time.LocalDate.parse(endDate) : null;

        return activityList.stream()
                .filter(item -> {
                    if (StringUtils.hasText(categoryFilter) && !"ALL".equalsIgnoreCase(categoryFilter)) {
                        if (item.getCategory() == null || !item.getCategory().equalsIgnoreCase(categoryFilter.trim())) {
                            return false;
                        }
                    }
                    if (start != null && item.getCreatedAt() != null && item.getCreatedAt().toLocalDate().isBefore(start)) {
                        return false;
                    }
                    if (end != null && item.getCreatedAt() != null && item.getCreatedAt().toLocalDate().isAfter(end)) {
                        return false;
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();
    }
   
    public ReversalWallet getReversalWallet(Long userId) {
        validateUserId(userId);

        return reversalWalletRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    ReversalWallet wallet = new ReversalWallet();
                    wallet.setUserId(userId);
                    wallet.setBalance(0.0);
                    wallet.setExpiresAt(null);
                    return wallet;
                });
    }

    @Transactional
    public ReversalWallet creditReversalWallet(
            Long userId,
            Double amount,
            String expiresAt
    ) {
        validateUserId(userId);
        validateAmount(amount, "Reversal wallet credit");

        ReversalWallet wallet =
                reversalWalletRepository.findByUserId(userId)
                        .orElseGet(ReversalWallet::new);

        wallet.setUserId(userId);

        double currentBalance =
                wallet.getBalance() == null
                        ? 0.0
                        : wallet.getBalance();

        wallet.setBalance(currentBalance + amount);
        wallet.setExpiresAt(expiresAt);

        return reversalWalletRepository.save(wallet);
    }


    @Transactional
public ReversalWallet debitReversalWallet(
        Long userId,
        Double amount
) {
    validateUserId(userId);
    validateAmount(amount, "Reversal wallet debit");

    ReversalWallet wallet =
            reversalWalletRepository.findByUserId(userId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Reversal wallet not found."
                            )
                    );

    double currentBalance =
            wallet.getBalance() == null
                    ? 0.0
                    : wallet.getBalance();

    if (currentBalance < amount) {
        throw new IllegalArgumentException(
                "Insufficient reversal wallet balance."
        );
    }

    wallet.setBalance(currentBalance - amount);

    return reversalWalletRepository.save(wallet);
}
    public WalletSummaryResponse getWalletSummary(Long userId) {
        validateUserId(userId);

        WalletBalance walletBalance = getWalletBalance(userId);
        ReversalWallet reversalWallet = getReversalWallet(userId);
        List<LedgerEntry> ledgerEntries = getLedgerEntries(userId);

        double cashback = 0.0;
        double referral = 0.0;
        double vendorRoyalty = 0.0;
        double pincodeRoyalty = 0.0;

        for (LedgerEntry entry : ledgerEntries) {
            if (entry.getAmount() == null || entry.getAmount() <= 0) {
                continue;
            }

            if (!StringUtils.hasText(entry.getCategory())) {
                continue;
            }

            String normalizedCategory =
                    entry.getCategory()
                            .trim()
                            .toUpperCase(Locale.ROOT);

            switch (normalizedCategory) {
                case "CASHBACK" ->
                        cashback += entry.getAmount();

                case "REFERRAL",
                     "REFERRAL_BONUS" ->
                        referral += entry.getAmount();

                case "VENDOR_ROYALTY" ->
                        vendorRoyalty += entry.getAmount();

                case "PINCODE_ROYALTY",
                     "PINCODE_CHAMPIONSHIP" ->
                        pincodeRoyalty += entry.getAmount();

                default -> {
                    // Other wallet entries are not earnings categories.
                }
            }
        }

        double totalEarnings =
                cashback
                        + referral
                        + vendorRoyalty
                        + pincodeRoyalty;

        WalletSummaryResponse response =
                new WalletSummaryResponse();

        response.setWalletBalance(
                walletBalance.getBalance() == null
                        ? 0.0
                        : walletBalance.getBalance()
        );

        response.setReversalBalance(
                reversalWallet.getBalance() == null
                        ? 0.0
                        : reversalWallet.getBalance()
        );

        response.setCashback(cashback);
        response.setReferral(referral);
        response.setVendorRoyalty(vendorRoyalty);
        response.setPincodeRoyalty(pincodeRoyalty);
        response.setTotalEarnings(totalEarnings);

        return response;
    }

    private LedgerEntry addLedgerEntry(
            Long userId,
            String category,
            Double amount,
            String sourceReference
    ) {
        LedgerEntry entry = new LedgerEntry();

        entry.setUserId(userId);
        entry.setCategory(
                category == null
                        ? null
                        : category.trim().toUpperCase(Locale.ROOT)
        );
        entry.setAmount(amount);
        entry.setSourceReference(sourceReference);
        entry.setCreatedAt(OffsetDateTime.now());

        return ledgerEntryRepository.save(entry);
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "A valid user ID is required."
            );
        }
    }

    private void validateAmount(
            Double amount,
            String operationName
    ) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException(
                    operationName + " amount must be greater than 0."
            );
        }

        if (!Double.isFinite(amount)) {
            throw new IllegalArgumentException(
                    operationName + " amount must be a valid number."
            );
        }
    }

    private void validateCategory(String category) {
        if (!StringUtils.hasText(category)) {
            throw new IllegalArgumentException(
                    "Wallet transaction category is required."
            );
        }
    }

    private String normalizeSourceReference(
            String sourceReference
    ) {
        return StringUtils.hasText(sourceReference)
                ? sourceReference.trim()
                : null;
    }
}