package com.viralpe.royalty.service;

import com.viralpe.royalty.dto.PincodeChampionshipHistoryEntryResponse;
import com.viralpe.royalty.dto.PincodeChampionshipHistoryResponse;
import com.viralpe.royalty.dto.PincodeChampionshipTickerResponse;
import com.viralpe.royalty.model.ChampionshipPhaseConfig;
import com.viralpe.royalty.model.PincodePool;
import com.viralpe.royalty.model.PincodePoolContribution;
import com.viralpe.royalty.model.PincodeRoyaltyLedger;
import com.viralpe.royalty.repository.ChampionshipPhaseConfigRepository;
import com.viralpe.royalty.repository.PincodePoolContributionRepository;
import com.viralpe.royalty.repository.PincodePoolRepository;
import com.viralpe.royalty.repository.PincodeRoyaltyLedgerRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class PincodeChampionshipService {

    private final PincodePoolRepository pincodePoolRepository;
    private final PincodePoolContributionRepository pincodePoolContributionRepository;
    private final PincodeRoyaltyLedgerRepository pincodeRoyaltyLedgerRepository;
    private final WalletService walletService;
    private final ChampionshipPhaseConfigRepository phaseConfigRepository;

    public PincodeChampionshipService(
            PincodePoolRepository pincodePoolRepository,
            PincodePoolContributionRepository pincodePoolContributionRepository,
            PincodeRoyaltyLedgerRepository pincodeRoyaltyLedgerRepository,
            WalletService walletService,
            ChampionshipPhaseConfigRepository phaseConfigRepository
    ) {
        this.pincodePoolRepository = pincodePoolRepository;
        this.pincodePoolContributionRepository = pincodePoolContributionRepository;
        this.pincodeRoyaltyLedgerRepository = pincodeRoyaltyLedgerRepository;
        this.walletService = walletService;
        this.phaseConfigRepository = phaseConfigRepository;
    }

    public String getActivePhase() {
        return phaseConfigRepository.findFirstByOrderByIdAsc()
                .map(ChampionshipPhaseConfig::getActivePhase)
                .orElse("DAILY");
    }

    @Transactional
    public String setActivePhase(String newPhase) {
        if (newPhase == null || newPhase.isBlank()) {
            throw new IllegalArgumentException("Phase cannot be blank");
        }
        String normalized = newPhase.toUpperCase().trim();
        if (!normalized.equals("DAILY") && !normalized.equals("WEEKLY") && !normalized.equals("MONTHLY")) {
            throw new IllegalArgumentException("Invalid phase. Must be DAILY, WEEKLY, or MONTHLY.");
        }

        ChampionshipPhaseConfig config = phaseConfigRepository.findFirstByOrderByIdAsc()
                .orElseGet(ChampionshipPhaseConfig::new);

        config.setActivePhase(normalized);
        config.setUpdatedAt(OffsetDateTime.now());
        phaseConfigRepository.save(config);

        return normalized;
    }

    @Transactional
    public PincodePool recordContribution(
            String pincode,
            Long sourceTransactionId,
            Long sourceUserId,
            String contributionType,
            Double contributionAmount
    ) {
        if (!StringUtils.hasText(pincode)
                || sourceTransactionId == null
                || contributionAmount == null
                || contributionAmount <= 0) {
            return null;
        }

        PincodePool pool = pincodePoolRepository.findByPincodeForUpdate(pincode)
                .orElseGet(() -> {
                    PincodePool newPool = new PincodePool();
                    newPool.setPincode(pincode);
                    newPool.setPoolBalance(0.0);
                    newPool.setCurrentCyclePool(0.0);
                    newPool.setCycleStartedAt(OffsetDateTime.now());
                    return newPool;
                });

        if (pool.getCycleStartedAt() == null) {
            pool.setCycleStartedAt(OffsetDateTime.now());
        }

        double currentCyclePool = pool.getCurrentCyclePool() == null
                ? 0.0
                : pool.getCurrentCyclePool();

        double updatedPoolValue = currentCyclePool + contributionAmount;
        pool.setCurrentCyclePool(updatedPoolValue);
        pool.setPoolBalance(updatedPoolValue);

        pool = pincodePoolRepository.save(pool);

        PincodePoolContribution contribution = new PincodePoolContribution();
        contribution.setPincode(pincode);
        contribution.setSourceTransactionId(sourceTransactionId);
        contribution.setSourceUserId(sourceUserId);
        contribution.setContributionType(contributionType);
        contribution.setAmount(contributionAmount);
        contribution.setSourceReference("TX-" + sourceTransactionId);
        contribution.setCreatedAt(OffsetDateTime.now());

        pincodePoolContributionRepository.save(contribution);

        return pool;
    }

    public PincodeChampionshipTickerResponse getTickerForPincode(String pincode) {
        PincodePool pool = pincodePoolRepository.findByPincode(pincode)
                .orElseGet(() -> {
                    PincodePool newPool = new PincodePool();
                    newPool.setPincode(pincode);
                    newPool.setCurrentCyclePool(0.0);
                    newPool.setPoolBalance(0.0);
                    newPool.setCycleStartedAt(OffsetDateTime.now());
                    return newPool;
                });

        PincodeChampionshipTickerResponse response = new PincodeChampionshipTickerResponse();
        response.setPincode(pool.getPincode());
        response.setCurrentCyclePool(pool.getCurrentCyclePool() == null ? 0.0 : pool.getCurrentCyclePool());
        response.setPoolBalance(pool.getPoolBalance() == null ? 0.0 : pool.getPoolBalance());
        response.setPhaseLabel(resolvePhaseLabel());
        response.setNextEvaluationAt(resolveNextEvaluationAt());
        response.setCountdownSeconds(resolveCountdownSeconds());
        response.setLastCycleWinnerUserId(pool.getLastCycleWinnerUserId());
        response.setLastCycleTotalPayout(pool.getLastCycleTotalPayout());
        response.setLastCycleEndedAt(pool.getLastCycleEndedAt());
        return response;
    }

    public PincodeChampionshipHistoryResponse getHistoryForPincode(String pincode) {
        PincodeChampionshipHistoryResponse response = new PincodeChampionshipHistoryResponse();
        PincodePool pool = pincodePoolRepository.findByPincode(pincode).orElse(null);

        response.setPincode(pincode);
        response.setCurrentCyclePool(pool == null || pool.getCurrentCyclePool() == null ? 0.0 : pool.getCurrentCyclePool());
        response.setPoolBalance(pool == null || pool.getPoolBalance() == null ? 0.0 : pool.getPoolBalance());

        List<PincodeRoyaltyLedger> ledgers = pincodeRoyaltyLedgerRepository.findAll().stream()
                .filter(entry -> pincode.equals(entry.getPincode()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();

        List<PincodeChampionshipHistoryEntryResponse> history = new ArrayList<>();
        for (PincodeRoyaltyLedger ledger : ledgers) {
            PincodeChampionshipHistoryEntryResponse entry = new PincodeChampionshipHistoryEntryResponse();
            entry.setId(ledger.getId());
            entry.setPincode(ledger.getPincode());
            entry.setWinnerUserId(ledger.getWinnerUserId());
            entry.setSourceTransactionId(ledger.getSourceTransactionId());
            entry.setPoolAmount(ledger.getPoolAmount());
            entry.setCycleEndAt(ledger.getCycleEndAt());
            entry.setCreatedAt(ledger.getCreatedAt());
            history.add(entry);
        }

        response.setHistory(history);
        return response;
    }

    @Transactional
    public void evaluateDailyPhase() {
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Asia/Kolkata"));
        List<PincodePool> pools = pincodePoolRepository.findByCurrentCyclePoolGreaterThan(0.0);

        for (PincodePool pool : pools) {
            if (pool.getCurrentCyclePool() == null || pool.getCurrentCyclePool() <= 0) {
                continue;
            }

            OffsetDateTime cycleStart = pool.getCycleStartedAt() == null
                    ? now
                    : pool.getCycleStartedAt();

            evaluatePoolWinner(pool, cycleStart, now);
        }
    }

    @Transactional
    public void evaluateWeeklyPhase() {
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Asia/Kolkata"));
        OffsetDateTime cycleStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<PincodePool> pools = pincodePoolRepository.findByCurrentCyclePoolGreaterThan(0.0);

        for (PincodePool pool : pools) {
            if (pool.getCurrentCyclePool() == null || pool.getCurrentCyclePool() <= 0) {
                continue;
            }

            evaluatePoolWinner(pool, cycleStart, now);
        }
    }

    @Transactional
    public void evaluateMonthlyPhase() {
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Asia/Kolkata"));
        OffsetDateTime cycleStart = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<PincodePool> pools = pincodePoolRepository.findByCurrentCyclePoolGreaterThan(0.0);

        for (PincodePool pool : pools) {
            if (pool.getCurrentCyclePool() == null || pool.getCurrentCyclePool() <= 0) {
                continue;
            }

            evaluatePoolWinner(pool, cycleStart, now);
        }
    }

    private void evaluatePoolWinner(PincodePool pool, OffsetDateTime cycleStart, OffsetDateTime now) {
        List<Object[]> results = pincodePoolContributionRepository.findTopContributorByPincodeAndCycle(
                pool.getPincode(),
                cycleStart,
                now
        );

        if (results.isEmpty()) {
            return;
        }

        Object[] row = results.get(0);
        Long winningUserId = (Long) row[0];
        Double payout = pool.getCurrentCyclePool();

        walletService.creditWalletBalance(
                winningUserId,
                payout,
                "PINCODE_CHAMPIONSHIP",
                "PINCODE_POOL_" + pool.getPincode() + "_" + pool.getId()
        );

        PincodeRoyaltyLedger ledgerEntry = new PincodeRoyaltyLedger();
        ledgerEntry.setPincode(pool.getPincode());
        ledgerEntry.setWinnerUserId(winningUserId);
        ledgerEntry.setSourceTransactionId(pool.getId());
        ledgerEntry.setPoolAmount(payout);
        ledgerEntry.setCycleEndAt(now);
        ledgerEntry.setCreatedAt(now);
        pincodeRoyaltyLedgerRepository.save(ledgerEntry);

        pool.setLastCycleWinnerUserId(winningUserId);
        pool.setLastCycleTotalPayout(payout);
        pool.setLastCycleEndedAt(now);
        pool.setCurrentCyclePool(0.0);
        pool.setPoolBalance(0.0);
        pool.setCycleStartedAt(now);
        pincodePoolRepository.save(pool);
    }

    private String resolvePhaseLabel() {
        String phase = getActivePhase();
        if ("WEEKLY".equalsIgnoreCase(phase)) return "Weekly";
        if ("MONTHLY".equalsIgnoreCase(phase)) return "Monthly";
        return "Daily";
    }

    private OffsetDateTime resolveNextEvaluationAt() {
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Asia/Kolkata"));
        String phase = getActivePhase();

        if ("WEEKLY".equalsIgnoreCase(phase)) {
            OffsetDateTime sunday = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            return sunday.toLocalDate().atTime(23, 59, 59).atOffset(ZoneId.of("Asia/Kolkata").getRules().getOffset(sunday.toLocalDateTime()));
        }

        if ("MONTHLY".equalsIgnoreCase(phase)) {
            var lastDay = now.toLocalDate().with(TemporalAdjusters.lastDayOfMonth());
            return lastDay.atTime(23, 59, 59).atOffset(ZoneId.of("Asia/Kolkata").getRules().getOffset(now.toLocalDateTime()));
        }

        return now.toLocalDate().atTime(23, 59, 59).atOffset(ZoneId.of("Asia/Kolkata").getRules().getOffset(now.toLocalDateTime()));
    }

    private Long resolveCountdownSeconds() {
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Asia/Kolkata"));
        OffsetDateTime target = resolveNextEvaluationAt();
        Duration duration = Duration.between(now, target);
        return Math.max(duration.getSeconds(), 0L);
    }
}
