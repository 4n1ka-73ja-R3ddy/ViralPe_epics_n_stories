package com.viralpe.royalty.service;

import com.viralpe.royalty.dto.VerticalRoyaltyCalculationResult;
import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import org.springframework.stereotype.Service;

@Service
public class VerticalRoyaltyService {

    private final RoyaltyConfigurationRepository royaltyConfigRepo;

    public VerticalRoyaltyService(RoyaltyConfigurationRepository royaltyConfigRepo) {
        this.royaltyConfigRepo = royaltyConfigRepo;
    }

    /**
     * Resolves the active RoyaltyConfiguration for a given category/vertical, falling back to 'GENERAL'
     * or the first available configuration.
     */
    public RoyaltyConfiguration resolveConfiguration(String category) {
        if (category != null && !category.isBlank()) {
            var cfg = royaltyConfigRepo.findByCategory(category.toUpperCase().trim());
            if (cfg.isPresent()) {
                return cfg.get();
            }
        }
        return royaltyConfigRepo.findByCategory("GENERAL")
                .orElseGet(() -> royaltyConfigRepo.findAll().stream().findFirst().orElse(null));
    }

    /**
     * Calculates vertical margin breakdown applying vertical-level royalty deduction at the root.
     */
    public VerticalRoyaltyCalculationResult calculateEffectiveMargin(
            String category,
            Double transactionAmount,
            Double apiCost
    ) {
        VerticalRoyaltyCalculationResult result = new VerticalRoyaltyCalculationResult();
        String normalizedCategory = (category == null || category.isBlank()) ? "GENERAL" : category.toUpperCase().trim();
        result.setCategory(normalizedCategory);

        double amount = (transactionAmount == null || transactionAmount < 0) ? 0.0 : transactionAmount;
        result.setTransactionAmount(amount);

        RoyaltyConfiguration cfg = resolveConfiguration(normalizedCategory);

        double profitMarginPercent = 0.0;
        double verticalRoyaltyPercent = 0.0;

        if (cfg != null) {
            profitMarginPercent = cfg.getProfitMarginPercentage() == null ? 0.0 : cfg.getProfitMarginPercentage();
            verticalRoyaltyPercent = cfg.getVerticalRoyaltyPercentage() == null ? 0.0 : cfg.getVerticalRoyaltyPercentage();
        }

        result.setProfitMarginPercentage(profitMarginPercent);
        result.setVerticalRoyaltyPercentage(verticalRoyaltyPercent);

        double grossProfit;
        if (apiCost != null && apiCost > 0 && amount > apiCost) {
            grossProfit = amount - apiCost;
        } else {
            grossProfit = amount * profitMarginPercent / 100.0;
        }

        result.setGrossProfitMargin(grossProfit);

        double verticalDeduction = grossProfit * verticalRoyaltyPercent / 100.0;
        result.setVerticalRoyaltyDeduction(verticalDeduction);

        double effectiveMargin = Math.max(0.0, grossProfit - verticalDeduction);
        result.setEffectiveProfitMargin(effectiveMargin);

        return result;
    }
}
