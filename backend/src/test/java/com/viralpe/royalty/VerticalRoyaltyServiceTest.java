package com.viralpe.royalty;

import com.viralpe.royalty.dto.VerticalRoyaltyCalculationResult;
import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.royalty.service.VerticalRoyaltyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class VerticalRoyaltyServiceTest {

    private RoyaltyConfigurationRepository repository;
    private VerticalRoyaltyService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(RoyaltyConfigurationRepository.class);
        service = new VerticalRoyaltyService(repository);
    }

    @Test
    void testCalculateEffectiveMarginWithVerticalDeduction() {
        RoyaltyConfiguration config = new RoyaltyConfiguration();
        config.setCategory("RECHARGE");
        config.setProfitMarginPercentage(10.0); // 10% gross margin on 100 = 10
        config.setVerticalRoyaltyPercentage(2.0); // 2% vertical royalty deduction on 10 = 0.2

        when(repository.findByCategory("RECHARGE")).thenReturn(Optional.of(config));

        VerticalRoyaltyCalculationResult result = service.calculateEffectiveMargin("RECHARGE", 100.0, null);

        assertEquals("RECHARGE", result.getCategory());
        assertEquals(100.0, result.getTransactionAmount());
        assertEquals(10.0, result.getGrossProfitMargin(), 0.001);
        assertEquals(0.2, result.getVerticalRoyaltyDeduction(), 0.001);
        assertEquals(9.8, result.getEffectiveProfitMargin(), 0.001);
    }

    @Test
    void testCalculateEffectiveMarginWithExplicitApiCost() {
        RoyaltyConfiguration config = new RoyaltyConfiguration();
        config.setCategory("VOUCHER");
        config.setVerticalRoyaltyPercentage(5.0); // 5% vertical royalty deduction on (100 - 80 = 20) = 1.0

        when(repository.findByCategory("VOUCHER")).thenReturn(Optional.of(config));

        VerticalRoyaltyCalculationResult result = service.calculateEffectiveMargin("VOUCHER", 100.0, 80.0);

        assertEquals("VOUCHER", result.getCategory());
        assertEquals(20.0, result.getGrossProfitMargin(), 0.001);
        assertEquals(1.0, result.getVerticalRoyaltyDeduction(), 0.001);
        assertEquals(19.0, result.getEffectiveProfitMargin(), 0.001);
    }
}
