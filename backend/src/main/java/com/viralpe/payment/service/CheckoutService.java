package com.viralpe.payment.service;

import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.dto.CheckoutResponse;
import com.viralpe.referral.service.ReferralService;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.royalty.service.CashbackService;
import com.viralpe.royalty.service.VendorRoyaltyService;
import com.viralpe.royalty.service.VerticalRoyaltyService;
import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import com.viralpe.user.exception.ProfileIncompleteException;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.service.WalletService;
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
    private final VendorRoyaltyService vendorRoyaltyService;
    private final UserRepository userRepository;
    private final RoyaltyConfigurationRepository royaltyConfigRepo;
    private final VerticalRoyaltyService verticalRoyaltyService;

    public CheckoutService(
            WalletService walletService,
            PaymentService paymentService,
            TransactionRepository transactionRepository,
            CashbackService cashbackService,
            ReferralService referralService,
            VendorRoyaltyService vendorRoyaltyService,
            UserRepository userRepository,
            RoyaltyConfigurationRepository royaltyConfigRepo,
            VerticalRoyaltyService verticalRoyaltyService
    ) {
        this.walletService = walletService;
        this.paymentService = paymentService;
        this.transactionRepository = transactionRepository;
        this.cashbackService = cashbackService;
        this.referralService = referralService;
        this.vendorRoyaltyService = vendorRoyaltyService;
        this.userRepository = userRepository;
        this.royaltyConfigRepo = royaltyConfigRepo;
        this.verticalRoyaltyService = verticalRoyaltyService;
    }

    @Transactional
    public CheckoutResponse processCheckout(CheckoutRequest request) {

        Long userId = request.getUserId();
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && !Boolean.TRUE.equals(user.getProfileComplete())) {
                throw new ProfileIncompleteException("Profile incomplete. Pincode entry required.");
            }
        }
        Long vendorId = request.getVendorId();
        Double amount = request.getAmount();

        double remaining = amount == null ? 0.0 : amount;

        double usedFromReversal = 0.0;

        if (request.isUseReversalWallet()) {

            ReversalWallet reversal =
                    walletService.getReversalWallet(userId);

            if (reversal != null &&
                    reversal.getBalance() != null &&
                    reversal.getBalance() > 0) {

                double take =
                        Math.min(reversal.getBalance(), remaining);

                walletService.debitReversalWallet(
                        userId,
                        take
                );

                usedFromReversal = take;
                remaining -= take;
            }
        }

        double usedFromWallet = 0.0;

        if (remaining > 0) {

            WalletBalance walletBalance =
                    walletService.getWalletBalance(userId);

            double available =
                    walletBalance.getBalance() == null
                            ? 0.0
                            : walletBalance.getBalance();

            double take =
                    Math.min(available, remaining);

            if (take > 0) {

                walletService.debitWalletBalance(
                        userId,
                        take,
                        "checkout",
                        "checkout"
                );

                usedFromWallet = take;
                remaining -= take;
            }
        }

        boolean gatewaySuccess = true;
        double fromGateway = 0.0;

        if (remaining > 0) {

            gatewaySuccess =
                    paymentService.processPayment(
                            remaining,
                            request.getProvider()
                    );

            fromGateway = remaining;
        }

        Transaction transaction = new Transaction();

        transaction.setUserId(userId);
        transaction.setAmount(amount);
        transaction.setTransactionType("CHECKOUT");
        transaction.setStatus(
                gatewaySuccess ? "SUCCESS" : "FAILED"
        );
        transaction.setProvider(request.getProvider());
        transaction.setReference("AUTO");
        transaction.setReversalAmountApplied(usedFromReversal);
        transaction.setWalletAmountApplied(usedFromWallet);
        transaction.setPaymentGatewayAmount(fromGateway);
        transaction.setRefundToReversal(!gatewaySuccess ? (usedFromWallet + usedFromReversal) : 0.0);
        transaction.setCreatedAt(OffsetDateTime.now());

        Transaction saved =
                transactionRepository.save(transaction);

        if (!gatewaySuccess) {

            if (usedFromWallet > 0) {

                walletService.creditWalletBalance(
                        userId,
                        usedFromWallet,
                        "refund",
                        "checkout_fail"
                );
            }

            if (usedFromReversal > 0) {

                walletService.creditReversalWallet(
                        userId,
                        usedFromReversal,
                        null
                );
            }

        } else {

            cashbackService.applyCashback(
                    userId,
                    saved.getId(),
                    "CHECKOUT",
                    amount,
                    0.0
            );

            User user =
                    userRepository.findById(userId).orElse(null);

            var marginResult = verticalRoyaltyService.calculateEffectiveMargin("CHECKOUT", amount, 0.0);
            var categoryConfig = verticalRoyaltyService.resolveConfiguration("CHECKOUT");

            if (user != null &&
                    user.getReferredByUserId() != null &&
                    categoryConfig != null) {

                double referralPercent =
                        categoryConfig.getReferralPercentage() == null
                                ? 0.0
                                : categoryConfig.getReferralPercentage();

                double bonus =
                        marginResult.getEffectiveProfitMargin() * referralPercent / 100.0;

                if (bonus > 0) {

                    referralService.creditReferral(
                            user.getReferredByUserId(),
                            bonus
                    );
                }
            }

            vendorRoyaltyService.creditRoyalty(
                    vendorId,
                    saved.getId(),
                    amount,
                    "CHECKOUT"
            );
        }

        return new CheckoutResponse(
                saved.getId(),
                saved.getStatus(),
                usedFromWallet + usedFromReversal,
                fromGateway
        );
    }
}