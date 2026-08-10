package com.viralpe.integration.job;

import com.viralpe.integration.dto.ReconciliationReportDTO;
import com.viralpe.integration.service.ProviderLedgerReconciliationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ProviderReconciliationJob {

    private static final Logger log = LoggerFactory.getLogger(ProviderReconciliationJob.class);

    private final ProviderLedgerReconciliationService reconciliationService;

    public ProviderReconciliationJob(ProviderLedgerReconciliationService reconciliationService) {
        this.reconciliationService = reconciliationService;
    }

    /**
     * Scheduled job running every 15 minutes to perform automated Provider-Ledger money audit.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void reconcilePendingTransactions() {
        log.info("Starting scheduled Provider-Ledger Reconciliation Job...");
        ReconciliationReportDTO report = reconciliationService.generateReconciliationReport();
        log.info("Scheduled Provider Reconciliation Job completed: Matched={}, Discrepancies={}, Monetary Variance=₹{}",
                report.getMatchedCount(), report.getDiscrepancyCount(), report.getTotalMonetaryVariance());
    }
}
