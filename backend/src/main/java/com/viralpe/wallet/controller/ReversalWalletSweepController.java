package com.viralpe.wallet.controller;

import com.viralpe.wallet.job.ReversalWalletSweepJob;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet/reversal")
public class ReversalWalletSweepController {

    private final ReversalWalletSweepJob reversalWalletSweepJob;

    public ReversalWalletSweepController(
            ReversalWalletSweepJob reversalWalletSweepJob
    ) {
        this.reversalWalletSweepJob = reversalWalletSweepJob;
    }

    @PostMapping("/sweep")
    public ResponseEntity<Map<String, String>> sweepExpiredWallets() {
        reversalWalletSweepJob.sweepExpiredReversalWallets();

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Expired reversal wallets were processed successfully."
                )
        );
    }
}