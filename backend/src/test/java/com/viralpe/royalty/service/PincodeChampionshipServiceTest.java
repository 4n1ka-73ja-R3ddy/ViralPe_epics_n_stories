package com.viralpe.royalty.service;

import com.viralpe.royalty.model.ChampionshipPhaseConfig;
import com.viralpe.royalty.model.PincodePool;
import com.viralpe.royalty.repository.ChampionshipPhaseConfigRepository;
import com.viralpe.royalty.repository.PincodePoolContributionRepository;
import com.viralpe.royalty.repository.PincodePoolRepository;
import com.viralpe.royalty.repository.PincodeRoyaltyLedgerRepository;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PincodeChampionshipServiceTest {

    @Mock
    private PincodePoolRepository pincodePoolRepository;

    @Mock
    private PincodePoolContributionRepository pincodePoolContributionRepository;

    @Mock
    private PincodeRoyaltyLedgerRepository pincodeRoyaltyLedgerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private ChampionshipPhaseConfigRepository phaseConfigRepository;

    @InjectMocks
    private PincodeChampionshipService pincodeChampionshipService;

    @Test
    void recordContributionShouldAccumulateCurrentCyclePool() {
        when(pincodePoolRepository.findByPincodeForUpdate("560001"))
                .thenReturn(Optional.empty());

        when(pincodePoolRepository.save(any(PincodePool.class)))
                .thenAnswer(invocation -> {
                    PincodePool pool = invocation.getArgument(0);
                    pool.setId(101L);
                    return pool;
                });

        when(pincodePoolContributionRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PincodePool pool = pincodeChampionshipService.recordContribution(
                "560001",
                9L,
                100L,
                "CASHBACK",
                12.5
        );

        assertEquals(12.5, pool.getCurrentCyclePool());
    }

    @Test
    void testActivePhaseConfiguration() {
        ChampionshipPhaseConfig config = new ChampionshipPhaseConfig();
        config.setActivePhase("WEEKLY");
        when(phaseConfigRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(config));

        assertEquals("WEEKLY", pincodeChampionshipService.getActivePhase());
    }
}
