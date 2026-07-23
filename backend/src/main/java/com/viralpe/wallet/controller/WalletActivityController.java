package com.viralpe.wallet.controller;

import com.viralpe.wallet.model.LedgerEntry;
import com.viralpe.wallet.repository.LedgerEntryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wallet/activity")
// developed by anika teja reddy
public class WalletActivityController {

    private final LedgerEntryRepository ledgerEntryRepository;

    public WalletActivityController(LedgerEntryRepository ledgerEntryRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @GetMapping("/ledger/{userId}")
    public ResponseEntity<List<LedgerEntry>> ledger(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ledgerEntryRepository.findByUserIdOrderByCreatedAtDesc(userId)
        );
    }
}