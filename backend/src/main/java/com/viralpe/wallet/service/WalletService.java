package com.viralpe.wallet.service;

import com.viralpe.wallet.model.LedgerEntry;
import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.repository.LedgerEntryRepository;
import com.viralpe.wallet.repository.ReversalWalletRepository;
import com.viralpe.wallet.repository.WalletBalanceRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class WalletService {

    private final WalletBalanceRepository walletBalanceRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final ReversalWalletRepository reversalWalletRepository;

    public WalletService(WalletBalanceRepository walletBalanceRepository,
                         LedgerEntryRepository ledgerEntryRepository,
                         ReversalWalletRepository reversalWalletRepository) {
        this.walletBalanceRepository = walletBalanceRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.reversalWalletRepository = reversalWalletRepository;
    }

    public WalletBalance getWalletBalance(Long userId) {
        return walletBalanceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    WalletBalance balance = new WalletBalance();
                    balance.setUserId(userId);
                    balance.setBalance(0.0);
                    return balance;
                });
    }

    public WalletBalance creditWalletBalance(Long userId, Double amount, String category, String sourceReference) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive.");
        }

        WalletBalance walletBalance = walletBalanceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    WalletBalance newBalance = new WalletBalance();
                    newBalance.setUserId(userId);
                    newBalance.setBalance(0.0);
                    return newBalance;
                });

        walletBalance.setBalance(walletBalance.getBalance() + amount);
        WalletBalance savedBalance = walletBalanceRepository.save(walletBalance);
        addLedgerEntry(userId, category, amount, sourceReference);
        return savedBalance;
    }

    public WalletBalance debitWalletBalance(Long userId, Double amount, String category, String sourceReference) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive.");
        }

        WalletBalance walletBalance = walletBalanceRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet balance not found for user."));

        if (walletBalance.getBalance() < amount) {
            throw new IllegalArgumentException("Insufficient wallet balance.");
        }

        walletBalance.setBalance(walletBalance.getBalance() - amount);
        WalletBalance savedBalance = walletBalanceRepository.save(walletBalance);
        addLedgerEntry(userId, category, -amount, sourceReference);
        return savedBalance;
    }

    public List<LedgerEntry> getLedgerEntries(Long userId) {
        return ledgerEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public ReversalWallet getReversalWallet(Long userId) {
        return reversalWalletRepository.findByUserId(userId).orElse(null);
    }

    public ReversalWallet creditReversalWallet(Long userId, Double amount, String expiresAt) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Reversal wallet credit amount must be positive.");
        }

        ReversalWallet wallet = reversalWalletRepository.findByUserId(userId)
                .orElseGet(ReversalWallet::new);
        wallet.setUserId(userId);
        wallet.setBalance((wallet.getBalance() == null ? 0.0 : wallet.getBalance()) + amount);
        wallet.setExpiresAt(expiresAt);
        return reversalWalletRepository.save(wallet);
    }

    private LedgerEntry addLedgerEntry(Long userId, String category, Double amount, String sourceReference) {
        LedgerEntry entry = new LedgerEntry();
        entry.setUserId(userId);
        entry.setCategory(category);
        entry.setAmount(amount);
        entry.setSourceReference(sourceReference);
        entry.setCreatedAt(OffsetDateTime.now());
        return ledgerEntryRepository.save(entry);
    }
}
