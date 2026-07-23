package com.viralpe.wallet.controller;

import com.viralpe.wallet.dto.LedgerEntryResponse;
import com.viralpe.wallet.dto.WalletBalanceResponse;
import com.viralpe.wallet.dto.WalletOperationRequest;
import com.viralpe.wallet.dto.WalletSummaryResponse;
import com.viralpe.wallet.model.LedgerEntry;
import com.viralpe.wallet.model.ReversalWallet;
import com.viralpe.wallet.model.WalletBalance;
import com.viralpe.wallet.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/summary/{userId}")
    public ResponseEntity<WalletSummaryResponse> getWalletSummary(
            @PathVariable Long userId
    ) {
        WalletSummaryResponse summary =
                walletService.getWalletSummary(userId);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/balance/{userId}")
    public ResponseEntity<WalletBalanceResponse> getBalance(
            @PathVariable Long userId
    ) {
        WalletBalance balance =
                walletService.getWalletBalance(userId);

        return ResponseEntity.ok(
                new WalletBalanceResponse(
                        balance.getUserId(),
                        balance.getBalance()
                )
        );
    }

    @PostMapping("/balance/credit")
    public ResponseEntity<WalletBalanceResponse> creditBalance(
            @Valid @RequestBody WalletOperationRequest request
    ) {
        WalletBalance balance =
                walletService.creditWalletBalance(
                        request.getUserId(),
                        request.getAmount(),
                        request.getCategory(),
                        request.getSourceReference()
                );

        return ResponseEntity.ok(
                new WalletBalanceResponse(
                        balance.getUserId(),
                        balance.getBalance()
                )
        );
    }

    @PostMapping("/balance/debit")
    public ResponseEntity<WalletBalanceResponse> debitBalance(
            @Valid @RequestBody WalletOperationRequest request
    ) {
        WalletBalance balance =
                walletService.debitWalletBalance(
                        request.getUserId(),
                        request.getAmount(),
                        request.getCategory(),
                        request.getSourceReference()
                );
// developed by anika teja reddy

        return ResponseEntity.ok(
                new WalletBalanceResponse(
                        balance.getUserId(),
                        balance.getBalance()
                )
        );
    }

    @GetMapping("/ledger/{userId}")
    public ResponseEntity<List<LedgerEntryResponse>> getLedger(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                toLedgerResponse(
                        walletService.getLedgerEntries(userId)
                )
        );
    }

    @GetMapping("/earnings/{userId}")
    public ResponseEntity<List<LedgerEntryResponse>> getEarningsLedger(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                toLedgerResponse(
                        walletService.getEarningsLedger(userId)
                )
        );
    }

    @GetMapping("/reversal/{userId}")
    public ResponseEntity<ReversalWallet> getReversalWallet(
            @PathVariable Long userId
    ) {
        ReversalWallet wallet =
                walletService.getReversalWallet(userId);

        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/reversal/credit")
    public ResponseEntity<ReversalWallet> creditReversalWallet(
            @Valid @RequestBody WalletOperationRequest request
    ) {
        ReversalWallet wallet =
                walletService.creditReversalWallet(
                        request.getUserId(),
                        request.getAmount(),
                        request.getExpiresAt()
                );

        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/reversal/debit")
    public ResponseEntity<ReversalWallet> debitReversalWallet(
            @Valid @RequestBody WalletOperationRequest request
    ) {
        ReversalWallet wallet =
                walletService.debitReversalWallet(
                        request.getUserId(),
                        request.getAmount()
                );

        return ResponseEntity.ok(wallet);
    }

    private List<LedgerEntryResponse> toLedgerResponse(
            List<LedgerEntry> entries
    ) {
        return entries.stream()
                .map(entry ->
                        new LedgerEntryResponse(
                                entry.getId(),
                                entry.getCategory(),
                                entry.getAmount(),
                                entry.getSourceReference(),
                                entry.getCreatedAt()
                        )
                )
                .collect(Collectors.toList());
    }
}