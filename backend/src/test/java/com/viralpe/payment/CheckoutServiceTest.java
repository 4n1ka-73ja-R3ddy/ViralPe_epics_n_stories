package com.viralpe.payment;

import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.service.CheckoutService;
import com.viralpe.payment.service.PaymentService;
import com.viralpe.royalty.service.CashbackService;
import com.viralpe.referral.service.ReferralService;
import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.service.WalletService;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class CheckoutServiceTest {

    private WalletService walletService;
    private PaymentService paymentService;
    private TransactionRepository txRepo;
    private CashbackService cashbackService;
    private ReferralService referralService;
    private UserRepository userRepository;
    private RoyaltyConfigurationRepository royaltyConfigRepo;
    private CheckoutService checkoutService;

    @BeforeEach
    public void setup() {
        walletService = mock(WalletService.class);
        paymentService = mock(PaymentService.class);
        txRepo = mock(TransactionRepository.class);
        cashbackService = mock(CashbackService.class);
        referralService = mock(ReferralService.class);
        userRepository = mock(UserRepository.class);
        royaltyConfigRepo = mock(RoyaltyConfigurationRepository.class);

        checkoutService = new CheckoutService(walletService, paymentService, txRepo, cashbackService, referralService, userRepository, royaltyConfigRepo);
    }

    @Test
    public void checkout_uses_wallet_and_gateway_and_applies_cashback() {
        CheckoutRequest req = new CheckoutRequest();
        req.setUserId(10L);
        req.setAmount(100.0);
        req.setProvider("UPI");

        WalletBalance wb = new WalletBalance();
        wb.setUserId(10L);
        wb.setBalance(40.0);
        when(walletService.getWalletBalance(10L)).thenReturn(wb);
        when(paymentService.processPayment(60.0, "UPI")).thenReturn(true);
        when(txRepo.save(any(Transaction.class))).thenAnswer(i -> i.getArguments()[0]);

        // user without referrer
        when(userRepository.findById(10L)).thenReturn(Optional.empty());

        var resp = checkoutService.processCheckout(req);
        assertNotNull(resp);
        // verify wallet debit called for 40
        verify(walletService).debitWalletBalance(10L, 40.0, "checkout", "checkout");
        // verify payment was processed for remaining 60
        verify(paymentService).processPayment(60.0, "UPI");
        // verify cashback applied
        verify(cashbackService).applyCashback(10L, 100.0);
    }
}
