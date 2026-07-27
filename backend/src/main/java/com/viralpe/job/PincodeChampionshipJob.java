package com.viralpe.job;

import com.viralpe.royalty.service.PincodeChampionshipService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;

@Component
public class PincodeChampionshipJob {

    private static final Logger log = LoggerFactory.getLogger(PincodeChampionshipJob.class);
    private static final ZoneId INDIA_ZONE = ZoneId.of("Asia/Kolkata");

    private final PincodeChampionshipService pincodeChampionshipService;

    public PincodeChampionshipJob(PincodeChampionshipService pincodeChampionshipService) {
        this.pincodeChampionshipService = pincodeChampionshipService;
    }

    @Scheduled(cron = "59 59 23 * * *", zone = "Asia/Kolkata")
    public void evaluateChampionshipByPhase() {
        OffsetDateTime now = OffsetDateTime.now(INDIA_ZONE);
        String activePhase = pincodeChampionshipService.getActivePhase();

        if ("WEEKLY".equalsIgnoreCase(activePhase)) {
            if (now.getDayOfWeek() == DayOfWeek.SUNDAY) {
                log.info("Executing WEEKLY pincode championship evaluation.");
                pincodeChampionshipService.evaluateWeeklyPhase();
            } else {
                log.info("Skipping weekly evaluation: today is not Sunday.");
            }
            return;
        }

        if ("MONTHLY".equalsIgnoreCase(activePhase)) {
            boolean isMonthlyBoundary = now.getDayOfMonth() == now.toLocalDate().with(TemporalAdjusters.lastDayOfMonth()).getDayOfMonth();
            if (isMonthlyBoundary) {
                log.info("Executing MONTHLY pincode championship evaluation.");
                pincodeChampionshipService.evaluateMonthlyPhase();
            } else {
                log.info("Skipping monthly evaluation: today is not last day of month.");
            }
            return;
        }

        log.info("Executing DAILY pincode championship evaluation.");
        pincodeChampionshipService.evaluateDailyPhase();
    }
}
