package com.viralpe.integration.orchestration;

import com.viralpe.integration.controller.ProviderCallbackController;
import com.viralpe.integration.dto.ProviderWebhookPayloadDTO;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.repository.LedgerEntryRepository;
import com.viralpe.wallet.repository.ReversalWalletRepository;
import com.viralpe.wallet.repository.WalletBalanceRepository;
import com.viralpe.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class IdempotencyConcurrencyTest {

    private IdempotencyService idempotencyService;
    private WalletService walletService;
    private WalletBalanceRepository walletBalanceRepository;
    private LedgerEntryRepository ledgerEntryRepository;
    private ReversalWalletRepository reversalWalletRepository;

    @BeforeEach
    public void setUp() {
        idempotencyService = new IdempotencyService();
        walletBalanceRepository = Mockito.mock(WalletBalanceRepository.class);
        ledgerEntryRepository = Mockito.mock(LedgerEntryRepository.class);
        reversalWalletRepository = Mockito.mock(ReversalWalletRepository.class);

        walletService = new WalletService(walletBalanceRepository, ledgerEntryRepository, reversalWalletRepository);
    }

    @Test
    @DisplayName("Task 7: Duplicate request with same idempotency key returns cached response")
    public void testDuplicateRequestSuppression() {
        String key = "IDEM-TEST-101";
        String firstResult = "SUCCESS_TXN_001";

        assertFalse(idempotencyService.isProcessed(key));
        idempotencyService.recordResponse(key, firstResult);

        assertTrue(idempotencyService.isProcessed(key));
        assertEquals(firstResult, idempotencyService.getExistingResponse(key));
    }

    @Test
    @DisplayName("Task 8: Replayed vendor callback webhook returns duplicate: true")
    public void testReplayCallbackProtection() {
        ProviderCallbackController controller = new ProviderCallbackController(idempotencyService);
        ProviderWebhookPayloadDTO payload = new ProviderWebhookPayloadDTO();
        payload.setProviderReferenceId("KWIK-REF-999");
        payload.setOriginalCorrelationId("CORR-999");
        payload.setStatus("SUCCESS");
        payload.setSignature("VALID-SIG");

        // First callback invocation
        ResponseEntity<Map<String, Object>> resp1 = controller.handleProviderWebhook("KWIK", "VALID-SIG", "REPLAY-KEY-01", payload);
        assertEquals(200, resp1.getStatusCode().value());
        assertEquals(false, resp1.getBody().get("duplicate"));

        // Replayed callback invocation with same key
        ResponseEntity<Map<String, Object>> resp2 = controller.handleProviderWebhook("KWIK", "VALID-SIG", "REPLAY-KEY-01", payload);
        assertEquals(200, resp2.getStatusCode().value());
        assertEquals(true, resp2.getBody().get("duplicate"));
    }

    @Test
    @DisplayName("Task 9: Thread-safe concurrent debit calls execute sequentially without race conditions")
    public void testConcurrentWalletDebitsThreadSafety() throws InterruptedException {
        Long userId = 88L;
        WalletBalance balanceObj = new WalletBalance();
        balanceObj.setUserId(userId);
        balanceObj.setBalance(150.0);

        when(walletBalanceRepository.findByUserId(userId)).thenReturn(Optional.of(balanceObj));
        when(walletBalanceRepository.save(any(WalletBalance.class))).thenAnswer(i -> i.getArgument(0));

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    walletService.debitWalletBalance(userId, 50.0, "RECHARGE", "REF-" + Thread.currentThread().getId());
                    successCount.incrementAndGet();
                } catch (IllegalArgumentException e) {
                    failureCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        // With initial balance 150.0 and debit 50.0 per thread, exactly 3 threads must succeed and 7 must fail with insufficient balance
        assertEquals(3, successCount.get(), "Exactly 3 debits of 50.0 should succeed from 150.0 balance.");
        assertEquals(7, failureCount.get(), "Remaining 7 debits must fail with insufficient balance.");
        assertEquals(0.0, balanceObj.getBalance(), 0.001, "Final balance must be exactly 0.0.");
    }
}
