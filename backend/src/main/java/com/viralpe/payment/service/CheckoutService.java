package com.viralpe.payment.service;

import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.dto.CheckoutResponse;
import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.service.WalletService;
import com.viralpe.royalty.service.CashbackService;
import com.viralpe.referral.service.ReferralService;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class CheckoutService {

    private final WalletService walletService;
    private final PaymentService paymentService;
    private final TransactionRepository transactionRepository;
    private final CashbackService cashbackService;
    private final ReferralService referralService;
    private final UserRepository userRepository;
    private final RoyaltyConfigurationRepository royaltyConfigRepo;

    public CheckoutService(WalletService walletService,
                           PaymentService paymentService,
                           TransactionRepository transactionRepository,
                           CashbackService cashbackService,
                           ReferralService referralService,
                           UserRepository userRepository,
                           RoyaltyConfigurationRepository royaltyConfigRepo) {
        this.walletService = walletService;
        this.paymentService = paymentService;
        this.transactionRepository = transactionRepository;
        this.cashbackService = cashbackService;
        this.referralService = referralService;
        this.userRepository = userRepository;
        this.royaltyConfigRepo = royaltyConfigRepo;
    }

    @Transactional
    public CheckoutResponse processCheckout(CheckoutRequest request) {
        Long userId = request.getUserId();
        Double amount = request.getAmount();
        double remaining = amount == null ? 0.0 : amount;

        double usedFromReversal = 0.0;
        if (request.isUseReversalWallet()) {
            ReversalWallet reversal = walletService.getReversalWallet(userId);
            if (reversal != null && reversal.getBalance() != null && reversal.getBalance() > 0) {
                double take = Math.min(reversal.getBalance(), remaining);
                walletService.creditReversalWallet(userId, -take, null); // negative credit to deduct
                usedFromReversal = take;
                remaining -= take;
            }
        }

        double usedFromWallet = 0.0;
        if (remaining > 0) {
            WalletBalance wb = walletService.getWalletBalance(userId);
            double avail = wb.getBalance() == null ? 0.0 : wb.getBalance();
            double take = Math.min(avail, remaining);
            if (take > 0) {
                walletService.debitWalletBalance(userId, take, "checkout", "checkout");
                usedFromWallet = take;
                remaining -= take;
            }
        }

        boolean gatewaySuccess = true;
        double fromGateway = 0.0;
        if (remaining > 0) {
            gatewaySuccess = paymentService.processPayment(remaining, request.getProvider());
            fromGateway = remaining;
        }

        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setAmount(amount);
        tx.setTransactionType("CHECKOUT");
        tx.setStatus(gatewaySuccess ? "SUCCESS" : "FAILED");
        tx.setProvider(request.getProvider());
        tx.setReference("AUTO");
        tx.setCreatedAt(OffsetDateTime.now());
        Transaction saved = transactionRepository.save(tx);

        if (!gatewaySuccess) {
            // On gateway failure, refund wallet amounts back into reversal wallet
            if (usedFromWallet > 0) {
                walletService.creditWalletBalance(userId, usedFromWallet, "refund", "checkout_fail");
            }
            if (usedFromReversal > 0) {
                walletService.creditReversalWallet(userId, usedFromReversal, null);
            }
        } else {
            // On success: apply cashback and referral bonuses
            cashbackService.applyCashback(userId, amount);
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getReferredByUserId() != null) {
                double referralPercent = royaltyConfigRepo.findAll().stream().findFirst().map(r -> r.getReferralPercentage() == null ? 0.0 : r.getReferralPercentage()).orElse(0.0);
                double bonus = amount * referralPercent / 100.0;
                if (bonus > 0) referralService.creditReferral(user.getReferredByUserId(), bonus);
            }
            // vendor royalty requires vendorId in request/transaction; skipped if not present
        }

        return new CheckoutResponse(saved.getId(), saved.getStatus(), usedFromWallet + usedFromReversal, fromGateway);
    }
}
