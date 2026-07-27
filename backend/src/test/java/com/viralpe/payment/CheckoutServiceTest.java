package com.viralpe.payment;

import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.service.CheckoutService;
import com.viralpe.payment.service.PaymentService;
import com.viralpe.referral.service.ReferralService;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.royalty.service.CashbackService;
import com.viralpe.royalty.service.VendorRoyaltyService;
import com.viralpe.royalty.service.VerticalRoyaltyService;
import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class CheckoutServiceTest {

    private WalletService walletService;
    private PaymentService paymentService;
    private TransactionRepository txRepo;
    private CashbackService cashbackService;
    private ReferralService referralService;
    private VendorRoyaltyService vendorRoyaltyService;
    private UserRepository userRepository;
    private RoyaltyConfigurationRepository royaltyConfigRepo;
    private VerticalRoyaltyService verticalRoyaltyService;

    private CheckoutService checkoutService;

    @BeforeEach
    public void setup() {

        walletService = mock(WalletService.class);
        paymentService = mock(PaymentService.class);
        txRepo = mock(TransactionRepository.class);
        cashbackService = mock(CashbackService.class);
        referralService = mock(ReferralService.class);
        vendorRoyaltyService = mock(VendorRoyaltyService.class);
        userRepository = mock(UserRepository.class);
        royaltyConfigRepo = mock(RoyaltyConfigurationRepository.class);
        verticalRoyaltyService = new VerticalRoyaltyService(royaltyConfigRepo);

        checkoutService = new CheckoutService(
                walletService,
                paymentService,
                txRepo,
                cashbackService,
                referralService,
                vendorRoyaltyService,
                userRepository,
                royaltyConfigRepo,
                verticalRoyaltyService
        );
    }

    @Test
    public void checkout_uses_wallet_and_gateway_and_applies_cashback() {

        CheckoutRequest req = new CheckoutRequest();

        req.setUserId(10L);
        req.setVendorId(1L);
        req.setAmount(100.0);
        req.setProvider("UPI");

        WalletBalance wb = new WalletBalance();
        wb.setUserId(10L);
        wb.setBalance(40.0);

        when(walletService.getWalletBalance(10L)).thenReturn(wb);

        when(paymentService.processPayment(60.0, "UPI"))
                .thenReturn(true);

        when(txRepo.save(any(Transaction.class)))
                .thenAnswer(invocation -> {
                    Transaction tx = invocation.getArgument(0);
                    tx.setId(1L);
                    return tx;
                });

        when(userRepository.findById(10L))
                .thenReturn(Optional.empty());

        when(vendorRoyaltyService.creditRoyalty(
                anyLong(),
                anyLong(),
                anyDouble(),
                anyString()))
                .thenReturn(BigDecimal.ZERO);

        var response = checkoutService.processCheckout(req);

        assertNotNull(response);

        verify(walletService).debitWalletBalance(
                10L,
                40.0,
                "checkout",
                "checkout"
        );

        verify(paymentService).processPayment(
                60.0,
                "UPI"
        );

        verify(cashbackService).applyCashback(
                eq(10L),
                anyLong(),
                eq("CHECKOUT"),
                eq(100.0),
                eq(0.0)
        );

        verify(vendorRoyaltyService).creditRoyalty(
                eq(1L),
                anyLong(),
                eq(100.0),
                eq("CHECKOUT")
        );
    }
}