package com.viralpe.wallet;

import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.model.LedgerEntry;
import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.repository.LedgerEntryRepository;
import com.viralpe.wallet.repository.ReversalWalletRepository;
import com.viralpe.wallet.repository.WalletBalanceRepository;
import com.viralpe.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class WalletServiceTest {

    private WalletBalanceRepository balanceRepo;
    private LedgerEntryRepository ledgerRepo;
    private ReversalWalletRepository reversalRepo;
    private WalletService walletService;

    @BeforeEach
    public void setup() {
        balanceRepo = mock(WalletBalanceRepository.class);
        ledgerRepo = mock(LedgerEntryRepository.class);
        reversalRepo = mock(ReversalWalletRepository.class);
        walletService = new WalletService(balanceRepo, ledgerRepo, reversalRepo);
    }

    @Test
    public void credit_increases_balance_and_creates_ledger() {
        when(balanceRepo.findByUserId(1L)).thenReturn(Optional.empty());
        when(balanceRepo.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(ledgerRepo.save(any())).thenAnswer(i -> i.getArguments()[0]);

        WalletBalance wb = walletService.creditWalletBalance(1L, 100.0, "test", "src");
        assertNotNull(wb);
        assertEquals(100.0, wb.getBalance());

        ArgumentCaptor<LedgerEntry> cap = ArgumentCaptor.forClass(LedgerEntry.class);
        verify(ledgerRepo).save(cap.capture());
        assertEquals(100.0, cap.getValue().getAmount());
    }

    @Test
    public void debit_reduces_balance_and_creates_negative_ledger() {
        WalletBalance existing = new WalletBalance();
        existing.setUserId(2L);
        existing.setBalance(200.0);
        when(balanceRepo.findByUserId(2L)).thenReturn(Optional.of(existing));
        when(balanceRepo.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(ledgerRepo.save(any())).thenAnswer(i -> i.getArguments()[0]);

        WalletBalance wb = walletService.debitWalletBalance(2L, 50.0, "test", "src");
        assertEquals(150.0, wb.getBalance());

        ArgumentCaptor<LedgerEntry> cap = ArgumentCaptor.forClass(LedgerEntry.class);
        verify(ledgerRepo).save(cap.capture());
        assertEquals(-50.0, cap.getValue().getAmount());
    }

    @Test
    public void reversal_credit_works() {
        when(reversalRepo.findByUserId(3L)).thenReturn(Optional.empty());
        when(reversalRepo.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ReversalWallet r = walletService.creditReversalWallet(3L, 30.0, "2026-12-31");
        assertNotNull(r);
        assertEquals(30.0, r.getBalance());
    }
}
