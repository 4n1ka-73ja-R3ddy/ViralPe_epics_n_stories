package com.viralpe.royalty.controller;

import com.viralpe.royalty.dto.PincodeChampionshipHistoryResponse;
import com.viralpe.royalty.dto.PincodeChampionshipTickerResponse;
import com.viralpe.royalty.model.PincodePool;
import com.viralpe.royalty.repository.PincodePoolRepository;
import com.viralpe.royalty.service.PincodeChampionshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/pincode-pool")
public class PincodeChampionshipController {

    private final PincodePoolRepository pincodePoolRepository;
    private final PincodeChampionshipService pincodeChampionshipService;

    public PincodeChampionshipController(
            PincodePoolRepository pincodePoolRepository,
            PincodeChampionshipService pincodeChampionshipService
    ) {
        this.pincodePoolRepository = pincodePoolRepository;
        this.pincodeChampionshipService = pincodeChampionshipService;
    }

    @GetMapping("/top")
    public ResponseEntity<List<PincodePool>> topPincodes() {

        List<PincodePool> all = pincodePoolRepository.findAll();

        all.sort((a, b) -> Double.compare(
                b.getPoolBalance() == null ? 0.0 : b.getPoolBalance(),
                a.getPoolBalance() == null ? 0.0 : a.getPoolBalance()
        ));

        return ResponseEntity.ok(all);
    }

    @GetMapping("/current/{pincode}")
    public ResponseEntity<PincodePool> currentPool(@PathVariable String pincode) {
        return pincodePoolRepository.findByPincode(pincode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ticker/{pincode}")
    public ResponseEntity<PincodeChampionshipTickerResponse> ticker(@PathVariable String pincode) {
        return ResponseEntity.ok(pincodeChampionshipService.getTickerForPincode(pincode));
    }

    @GetMapping("/history/{pincode}")
    public ResponseEntity<PincodeChampionshipHistoryResponse> history(@PathVariable String pincode) {
        return ResponseEntity.ok(pincodeChampionshipService.getHistoryForPincode(pincode));
    }

    @GetMapping("/phase")
    public ResponseEntity<Map<String, String>> getPhase() {
        return ResponseEntity.ok(Map.of("activePhase", pincodeChampionshipService.getActivePhase()));
    }

    @PostMapping("/phase")
    public ResponseEntity<Map<String, String>> setPhase(@RequestParam String phase) {
        String updated = pincodeChampionshipService.setActivePhase(phase);
        return ResponseEntity.ok(Map.of("activePhase", updated, "message", "Championship active phase updated to " + updated));
    }

    @PostMapping("/evaluate-daily")
    public ResponseEntity<String> evaluateDailyPhase() {
        pincodeChampionshipService.evaluateDailyPhase();
        return ResponseEntity.ok("Daily championship evaluation executed.");
    }

    @PostMapping("/evaluate-weekly")
    public ResponseEntity<String> evaluateWeeklyPhase() {
        pincodeChampionshipService.evaluateWeeklyPhase();
        return ResponseEntity.ok("Weekly championship evaluation executed.");
    }

    @PostMapping("/evaluate-monthly")
    public ResponseEntity<String> evaluateMonthlyPhase() {
        pincodeChampionshipService.evaluateMonthlyPhase();
        return ResponseEntity.ok("Monthly championship evaluation executed.");
    }
}