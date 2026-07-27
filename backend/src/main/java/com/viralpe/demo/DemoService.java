package com.viralpe.demo;

import com.viralpe.referral.model.ReferralBonus;
import com.viralpe.referral.repository.ReferralBonusRepository;
import com.viralpe.royalty.model.CashbackLedger;
import com.viralpe.royalty.repository.CashbackLedgerRepository;
import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import com.viralpe.wallet.model.LedgerEntry;
import com.viralpe.wallet.repository.LedgerEntryRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class DemoService {

    private final WalletService walletService;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CashbackLedgerRepository cashbackLedgerRepository;
    private final ReferralBonusRepository referralBonusRepository;

    public DemoService(
            WalletService walletService,
            TransactionRepository transactionRepository,
            LedgerEntryRepository ledgerEntryRepository,
            CashbackLedgerRepository cashbackLedgerRepository,
            ReferralBonusRepository referralBonusRepository
    ) {
        this.walletService = walletService;
        this.transactionRepository = transactionRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.cashbackLedgerRepository = cashbackLedgerRepository;
        this.referralBonusRepository = referralBonusRepository;
    }

    @Transactional
    public void loadDemoData(Long userId) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // 1. Seed Multi-Date Service Transactions
        createTransaction(userId, "RECHARGE", 299.0, "SUCCESS", "Airtel Prepaid", 0.0, 299.0, 0.0, 0.0, now.minusDays(25));
        createTransaction(userId, "BILL_PAYMENT", 1450.0, "SUCCESS", "BESCOM Electricity", 150.0, 500.0, 800.0, 0.0, now.minusDays(20));
        createTransaction(userId, "VOUCHER", 500.0, "FAILED", "Amazon Pay Gift Card", 0.0, 500.0, 0.0, 500.0, now.minusDays(15));
        createTransaction(userId, "CHECKOUT", 850.0, "SUCCESS", "Zomato Pay", 200.0, 450.0, 200.0, 0.0, now.minusDays(10));
        createTransaction(userId, "RECHARGE", 666.0, "SUCCESS", "Jio Prepaid", 0.0, 666.0, 0.0, 0.0, now.minusDays(5));
        createTransaction(userId, "BILL_PAYMENT", 999.0, "SUCCESS", "Airtel Broadband", 100.0, 899.0, 0.0, 0.0, now.minusDays(1));

        // 2. Seed Multi-Date Wallet Activity Log Ledger Entries
        createLedger(userId, "PROMOTIONAL_ADD_ON", 5000.0, "Admin Add-On Presentation Credit", now.minusDays(28));
        createLedger(userId, "CASHBACK", 45.0, "Cashback - Airtel Recharge", now.minusDays(25));
        createLedger(userId, "REFERRAL", 150.0, "Referral Bonus - User #104", now.minusDays(20));
        createLedger(userId, "VENDOR_ROYALTY", 320.0, "Vendor Royalty Commission", now.minusDays(18));
        createLedger(userId, "REFUND", 500.0, "Reversal Refund - Failed Voucher #3", now.minusDays(15));
        createLedger(userId, "PINCODE_CHAMPIONSHIP", 850.0, "Pincode 560001 Championship Win", now.minusDays(12));
        createLedger(userId, "CHECKOUT", -450.0, "Checkout Debit - Zomato Pay", now.minusDays(10));
        createLedger(userId, "CASHBACK", 88.50, "Cashback - Jio Recharge", now.minusDays(5));
        createLedger(userId, "REFERRAL", 200.0, "Referral Bonus - User #108", now.minusDays(2));
        createLedger(userId, "CHECKOUT", -899.0, "Checkout Debit - Airtel Broadband", now.minusDays(1));

        // 3. Seed Multi-Date Cashback Ledger Entries
        createCashback(userId, 101L, "RECHARGE", 50.0, 5.0, 45.0, 50.0, 0.1, now.minusDays(25));
        createCashback(userId, 102L, "BILL_PAYMENT", 120.0, 12.0, 108.0, 40.0, 0.1, now.minusDays(18));
        createCashback(userId, 105L, "RECHARGE", 98.33, 9.83, 88.50, 50.0, 0.1, now.minusDays(5));
        createCashback(userId, 106L, "BILL_PAYMENT", 150.0, 15.0, 135.0, 40.0, 0.1, now.minusDays(1));

        // 4. Seed Multi-Date Referral Bonus Entries
        createReferralBonus(userId, 104L, 102L, 1450.0, 1400.0, 50.0, 20.0, 150.0, now.minusDays(20));
        createReferralBonus(userId, 108L, 106L, 999.0, 950.0, 49.0, 20.0, 200.0, now.minusDays(2));

        // 5. Ensure Reversal Wallet & Wallet Balance Summary are Populated
        walletService.creditReversalWallet(userId, 350.0, LocalDate.now().plusDays(1).toString());
        walletService.creditWalletBalance(userId, 5000.0, "PROMOTIONAL_ADD_ON", "DEMO-INIT");
    }

    private void createTransaction(
            Long userId,
            String type,
            Double amount,
            String status,
            String provider,
            Double reversalApplied,
            Double walletApplied,
            Double pgAmount,
            Double refundReversal,
            OffsetDateTime createdAt
    ) {
        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setTransactionType(type);
        tx.setAmount(amount);
        tx.setStatus(status);
        tx.setProvider(provider);
        tx.setReference("DEMO-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000));
        tx.setReversalAmountApplied(reversalApplied);
        tx.setWalletAmountApplied(walletApplied);
        tx.setPaymentGatewayAmount(pgAmount);
        tx.setRefundToReversal(refundReversal);
        tx.setCreatedAt(createdAt);
        transactionRepository.save(tx);
    }

    private void createLedger(Long userId, String category, Double amount, String reference, OffsetDateTime createdAt) {
        LedgerEntry entry = new LedgerEntry();
        entry.setUserId(userId);
        entry.setCategory(category);
        entry.setAmount(amount);
        entry.setSourceReference(reference);
        entry.setCreatedAt(createdAt);
        ledgerEntryRepository.save(entry);
    }

    private void createCashback(
            Long userId,
            Long txId,
            String txType,
            Double gross,
            Double deduction,
            Double net,
            Double cbPct,
            Double pinPct,
            OffsetDateTime createdAt
    ) {
        CashbackLedger cb = new CashbackLedger();
        cb.setUserId(userId);
        cb.setSourceTransactionId(txId);
        cb.setTransactionType(txType);
        cb.setGrossCashback(gross);
        cb.setPincodeDeduction(deduction);
        cb.setNetCashback(net);
        cb.setCashbackPercentage(cbPct);
        cb.setPincodePercentage(pinPct);
        cb.setCreatedAt(createdAt);
        cashbackLedgerRepository.save(cb);
    }

    private void createReferralBonus(
            Long referrerId,
            Long refereeId,
            Long txId,
            Double txAmount,
            Double apiCost,
            Double profitMargin,
            Double referralPct,
            Double bonusAmount,
            OffsetDateTime createdAt
    ) {
        try {
            ReferralBonus rb = new ReferralBonus();
            rb.setReferrerUserId(referrerId);
            rb.setRefereeUserId(refereeId);
            rb.setSourceTransactionId(txId);
            rb.setTransactionAmount(txAmount);
            rb.setApiCost(apiCost);
            rb.setProfitMargin(profitMargin);
            rb.setReferralPercentage(referralPct);
            rb.setReferralBonus(bonusAmount);
            rb.setCreatedAt(createdAt);
            referralBonusRepository.save(rb);
        } catch (Exception e) {
            System.err.println("Warning: Could not seed referral_bonus record: " + e.getMessage());
        }
    }
}