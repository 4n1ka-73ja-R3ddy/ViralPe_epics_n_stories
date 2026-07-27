package com.viralpe.royalty.controller;

import com.viralpe.royalty.dto.VerticalRoyaltyCalculationResult;
import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.model.RoyaltyConfigurationHistory;
import com.viralpe.royalty.repository.RoyaltyConfigurationHistoryRepository;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.royalty.service.VerticalRoyaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/royalty")
public class RoyaltyAdminController {

    private final RoyaltyConfigurationRepository royaltyConfigRepo;
    private final RoyaltyConfigurationHistoryRepository historyRepo;
    private final VerticalRoyaltyService verticalRoyaltyService;

    public RoyaltyAdminController(
            RoyaltyConfigurationRepository royaltyConfigRepo,
            RoyaltyConfigurationHistoryRepository historyRepo,
            VerticalRoyaltyService verticalRoyaltyService
    ) {
        this.royaltyConfigRepo = royaltyConfigRepo;
        this.historyRepo = historyRepo;
        this.verticalRoyaltyService = verticalRoyaltyService;
    }

    @GetMapping
    public List<RoyaltyConfiguration> list() {
        return royaltyConfigRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<RoyaltyConfiguration> createOrUpdate(
            @RequestBody RoyaltyConfiguration cfg,
            @RequestParam(required = false, defaultValue = "0") Long adminUserId,
            @RequestParam(required = false, defaultValue = "Updated royalty percentage split configuration") String reason
    ) {
        if (cfg.getCategory() == null || cfg.getCategory().isBlank()) {
            cfg.setCategory("GENERAL");
        } else {
            cfg.setCategory(cfg.getCategory().toUpperCase().trim());
        }

        // If ID is not present, check if category already exists to update
        if (cfg.getId() == null) {
            royaltyConfigRepo.findByCategory(cfg.getCategory())
                    .ifPresent(existing -> cfg.setId(existing.getId()));
        }

        OffsetDateTime now = OffsetDateTime.now();
        cfg.setEffectiveFrom(now);
        cfg.setUpdatedAt(now);

        RoyaltyConfiguration saved = royaltyConfigRepo.save(cfg);

        // Record configuration history for audit (Story 10.3)
        RoyaltyConfigurationHistory history = new RoyaltyConfigurationHistory();
        history.setCategory(saved.getCategory());
        history.setCashbackPercentage(saved.getCashbackPercentage());
        history.setReferralPercentage(saved.getReferralPercentage());
        history.setVendorRoyaltyPercentage(saved.getVendorRoyaltyPercentage());
        history.setProfitMarginPercentage(saved.getProfitMarginPercentage());
        history.setVerticalRoyaltyPercentage(saved.getVerticalRoyaltyPercentage());
        history.setPincodeCashbackFraction(saved.getPincodeCashbackFraction());
        history.setPincodeVendorFraction(saved.getPincodeVendorFraction());
        history.setEffectiveFrom(now);
        history.setCreatedAt(now);
        history.setAdminUserId(adminUserId);
        history.setChangeReason(reason);
        historyRepo.save(history);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/history")
    public ResponseEntity<List<RoyaltyConfigurationHistory>> getHistory() {
        return ResponseEntity.ok(historyRepo.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/verticals")
    public List<RoyaltyConfiguration> listVerticals() {
        return royaltyConfigRepo.findAll();
    }

    @GetMapping("/verticals/{category}")
    public ResponseEntity<RoyaltyConfiguration> getVertical(@PathVariable String category) {
        RoyaltyConfiguration cfg = verticalRoyaltyService.resolveConfiguration(category);
        if (cfg == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(cfg);
    }

    @PostMapping("/simulate")
    public ResponseEntity<VerticalRoyaltyCalculationResult> simulate(
            @RequestParam(required = false, defaultValue = "GENERAL") String category,
            @RequestParam double amount,
            @RequestParam(required = false) Double apiCost
    ) {
        VerticalRoyaltyCalculationResult result = verticalRoyaltyService.calculateEffectiveMargin(
                category,
                amount,
                apiCost
        );
        return ResponseEntity.ok(result);
    }
}
