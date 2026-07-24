package com.viralpe.transaction.service;

import com.viralpe.transaction.dto.CheckoutConfirmRequest;
import com.viralpe.transaction.dto.CheckoutConfirmResponse;
import com.viralpe.transaction.dto.CheckoutPreviewRequest;
import com.viralpe.transaction.dto.CheckoutPreviewResponse;
import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class TransactionService {

    private final WalletService walletService;
    private final TransactionRepository transactionRepository;

    public TransactionService(
            WalletService walletService,
            TransactionRepository transactionRepository
    ) {
        this.walletService = walletService;
        this.transactionRepository = transactionRepository;
    }

    public CheckoutPreviewResponse previewCheckout(
            CheckoutPreviewRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Checkout preview request is required."
            );
        }

        Long userId = request.getUserId();
        Double invoiceAmount = request.getInvoiceAmount();

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "A valid user ID is required."
            );
        }

        if (invoiceAmount == null
                || invoiceAmount <= 0
                || !Double.isFinite(invoiceAmount)) {
            throw new IllegalArgumentException(
                    "Invoice amount must be greater than 0."
            );
        }

        WalletBalance walletBalance =
                walletService.getWalletBalance(userId);

        ReversalWallet reversalWallet =
                walletService.getReversalWallet(userId);

        double availableWalletBalance =
                walletBalance.getBalance() == null
                        ? 0.0
                        : walletBalance.getBalance();

        double availableReversalBalance =
                reversalWallet.getBalance() == null
                        ? 0.0
                        : reversalWallet.getBalance();

        double reversalAmountApplied =
                Math.min(
                        availableReversalBalance,
                        invoiceAmount
                );

        double remainingAfterReversal =
                invoiceAmount - reversalAmountApplied;

        double requestedWalletAmount =
                request.getRequestedWalletAmount() == null
                        ? 0.0
                        : request.getRequestedWalletAmount();

        if (requestedWalletAmount < 0
                || !Double.isFinite(requestedWalletAmount)) {
            throw new IllegalArgumentException(
                    "Requested wallet amount cannot be negative."
            );
        }

        double walletAmountApplied =
                Math.min(
                        requestedWalletAmount,
                        Math.min(
                                availableWalletBalance,
                                remainingAfterReversal
                        )
                );

        double paymentGatewayAmount =
                remainingAfterReversal - walletAmountApplied;

        return new CheckoutPreviewResponse(
                invoiceAmount,
                availableReversalBalance,
                reversalAmountApplied,
                availableWalletBalance,
                walletAmountApplied,
                paymentGatewayAmount
        );
    }

    @Transactional
    public CheckoutConfirmResponse confirmCheckout(
            CheckoutConfirmRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Checkout confirmation request is required."
            );
        }

        validatePaymentMethod(request.getPaymentMethod());
        validateGatewayResult(request.getGatewayResult());

        String paymentMethod =
                request.getPaymentMethod()
                        .trim()
                        .toUpperCase();

        String gatewayResult =
                request.getGatewayResult()
                        .trim()
                        .toUpperCase();

        CheckoutPreviewRequest previewRequest =
                new CheckoutPreviewRequest();

        previewRequest.setUserId(request.getUserId());
        previewRequest.setInvoiceAmount(
                request.getInvoiceAmount()
        );
        previewRequest.setRequestedWalletAmount(
                request.getRequestedWalletAmount()
        );

        CheckoutPreviewResponse preview =
                previewCheckout(previewRequest);

        Long userId = request.getUserId();

        double reversalAmountUsed =
                preview.getReversalAmountApplied();

        double walletAmountUsed =
                preview.getWalletAmountApplied();

        String transactionReference =
                "TXN-" + UUID.randomUUID();

        ReversalWallet currentReversalWallet =
                walletService.getReversalWallet(userId);

        String originalReversalExpiry =
                currentReversalWallet.getExpiresAt();

        Transaction transaction = new Transaction();

        transaction.setUserId(userId);
        transaction.setTransactionType("CHECKOUT");
        transaction.setAmount(request.getInvoiceAmount());
        transaction.setProvider(paymentMethod);
        transaction.setReference(transactionReference);
        transaction.setStatus("PENDING");
        transaction.setCreatedAt(OffsetDateTime.now());

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        /*
         * Deduct reversal-wallet balance first.
         */
        if (reversalAmountUsed > 0) {
            walletService.debitReversalWallet(
                    userId,
                    reversalAmountUsed
            );
        }

        /*
         * Deduct normal wallet balance second.
         */
        if (walletAmountUsed > 0) {
            walletService.debitWalletBalance(
                    userId,
                    walletAmountUsed,
                    "CHECKOUT_PAYMENT",
                    transactionReference
            );
        }

        /*
         * Successful payment:
         * Keep the wallet deductions.
         */
        if ("SUCCESS".equals(gatewayResult)) {
            savedTransaction.setStatus("SUCCESS");

            Transaction successfulTransaction =
                    transactionRepository.save(savedTransaction);

            return new CheckoutConfirmResponse(
                    successfulTransaction.getId(),
                    "SUCCESS",
                    paymentMethod,
                    preview.getInvoiceAmount(),
                    reversalAmountUsed,
                    walletAmountUsed,
                    preview.getPaymentGatewayAmount(),
                    "Payment completed successfully."
            );
        }

        /*
         * Failed payment:
         * Restore the deducted reversal-wallet amount.
         */
        if (reversalAmountUsed > 0) {
            walletService.creditReversalWallet(
                    userId,
                    reversalAmountUsed,
                    originalReversalExpiry
            );
        }

        /*
         * Failed payment:
         * Restore the deducted normal-wallet amount.
         */
        if (walletAmountUsed > 0) {
            walletService.creditWalletBalance(
                    userId,
                    walletAmountUsed,
                    "CHECKOUT_REVERSAL",
                    transactionReference
            );
        }

        savedTransaction.setStatus("FAILED");

        Transaction failedTransaction =
                transactionRepository.save(savedTransaction);

        return new CheckoutConfirmResponse(
                failedTransaction.getId(),
                "FAILED",
                paymentMethod,
                preview.getInvoiceAmount(),
                reversalAmountUsed,
                walletAmountUsed,
                preview.getPaymentGatewayAmount(),
                "Payment failed. Wallet amounts were restored."
        );
    }

    public String getTransactionStatus() {
        return "Transaction service is initialized.";
    }

    private void validatePaymentMethod(
            String paymentMethod
    ) {
        if (paymentMethod == null
                || paymentMethod.isBlank()) {
            throw new IllegalArgumentException(
                    "Payment method is required."
            );
        }

        String normalizedPaymentMethod =
                paymentMethod.trim().toUpperCase();

        if (!normalizedPaymentMethod.equals("UPI")
                && !normalizedPaymentMethod.equals("CARD")
                && !normalizedPaymentMethod.equals("NET_BANKING")) {
            throw new IllegalArgumentException(
                    "Payment method must be UPI, CARD, or NET_BANKING."
            );
        }
    }

    private void validateGatewayResult(
            String gatewayResult
    ) {
        if (gatewayResult == null
                || gatewayResult.isBlank()) {
            throw new IllegalArgumentException(
                    "Gateway result is required."
            );
        }

        String normalizedGatewayResult =
                gatewayResult.trim().toUpperCase();

        if (!normalizedGatewayResult.equals("SUCCESS")
                && !normalizedGatewayResult.equals("FAILED")) {
            throw new IllegalArgumentException(
                    "Gateway result must be SUCCESS or FAILED."
            );
        }
    }
}