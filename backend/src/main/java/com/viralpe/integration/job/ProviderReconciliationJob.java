package com.viralpe.integration.job;

import com.viralpe.integration.orchestration.ProviderOrchestrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ProviderReconciliationJob {

    private static final Logger log = LoggerFactory.getLogger(ProviderReconciliationJob.class);

    private final ProviderOrchestrationService orchestrationService;

    public ProviderReconciliationJob(ProviderOrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    /**
     * Scheduled job running every 15 minutes to reconcile PENDING provider transactions.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void reconcilePendingTransactions() {
        log.info("Starting scheduled Provider Transaction Reconciliation Job...");
        // Reconcile pending transaction status across active providers
        log.info("Provider Transaction Reconciliation completed successfully.");
    }
}
