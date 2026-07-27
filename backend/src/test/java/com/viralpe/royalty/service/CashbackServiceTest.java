package com.viralpe.royalty.service;

import com.viralpe.royalty.dto.CashbackHistoryResponse;
import com.viralpe.royalty.dto.VerticalRoyaltyCalculationResult;
import com.viralpe.royalty.model.CashbackLedger;
import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.repository.CashbackLedgerRepository;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CashbackServiceTest {

    @Mock
    private RoyaltyConfigurationRepository royaltyConfigRepo;

    @Mock
    private WalletService walletService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CashbackLedgerRepository cashbackLedgerRepository;

    @Mock
    private PincodeChampionshipService pincodeChampionshipService;

    @Mock
    private VerticalRoyaltyService verticalRoyaltyService;

    @InjectMocks
    private CashbackService cashbackService;

    @Test
    void applyCashbackCalculatesGrossDeductionAndNetCorrectly() {
        Long userId = 1L;
        Long txId = 100L;
        String txType = "CHECKOUT";
        Double grossPaid = 1000.0;

        VerticalRoyaltyCalculationResult marginResult = new VerticalRoyaltyCalculationResult();
        marginResult.setCategory(txType);
        marginResult.setTransactionAmount(grossPaid);
        marginResult.setGrossProfitMargin(100.0);
        marginResult.setVerticalRoyaltyDeduction(20.0);
        marginResult.setEffectiveProfitMargin(80.0);

        when(verticalRoyaltyService.calculateEffectiveMargin(txType, grossPaid, 0.0)).thenReturn(marginResult);

        RoyaltyConfiguration cfg = new RoyaltyConfiguration();
        cfg.setCategory(txType);
        cfg.setCashbackPercentage(50.0); // Gross cashback = 80 * 50% = 40.0
        cfg.setPincodeDeductionFraction(0.1); // Pincode deduction = 40 * 0.1 = 4.0, Net = 36.0
        when(verticalRoyaltyService.resolveConfiguration(txType)).thenReturn(cfg);

        User user = new User();
        user.setId(userId);
        user.setRegisteredPincode("560001");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        cashbackService.applyCashback(userId, txId, txType, grossPaid, 0.0);

        verify(walletService).creditWalletBalance(eq(userId), eq(36.0), eq("cashback"), eq("100"));
        verify(pincodeChampionshipService).recordContribution(eq("560001"), eq(txId), eq(userId), eq("CASHBACK"), eq(4.0));

        ArgumentCaptor<CashbackLedger> ledgerCap = ArgumentCaptor.forClass(CashbackLedger.class);
        verify(cashbackLedgerRepository).save(ledgerCap.capture());

        CashbackLedger saved = ledgerCap.getValue();
        assertEquals(40.0, saved.getGrossCashback());
        assertEquals(4.0, saved.getPincodeDeduction());
        assertEquals(36.0, saved.getNetCashback());
    }

    @Test
    void getHistoryReturnsAggregatedCashbackHistory() {
        CashbackLedger ledger1 = new CashbackLedger();
        ledger1.setId(1L);
        ledger1.setUserId(1L);
        ledger1.setGrossCashback(40.0);
        ledger1.setPincodeDeduction(4.0);
        ledger1.setNetCashback(36.0);
        ledger1.setTransactionType("CHECKOUT");
        ledger1.setCreatedAt(OffsetDateTime.now());

        when(cashbackLedgerRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(ledger1));

        CashbackHistoryResponse res = cashbackService.getHistory(1L);

        assertEquals(1L, res.getUserId());
        assertEquals(36.0, res.getTotalCashback());
        assertEquals(1, res.getCashbackHistory().size());
        assertEquals(40.0, res.getCashbackHistory().get(0).getGrossCashback());
        assertEquals(4.0, res.getCashbackHistory().get(0).getPincodeDeduction());
    }
}
