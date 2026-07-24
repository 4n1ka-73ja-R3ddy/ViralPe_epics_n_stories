package com.viralpe.job;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class JobScheduler {

    private static final Logger log = LoggerFactory.getLogger(JobScheduler.class);

    @Scheduled(fixedDelayString = "PT1H")
    public void hourlyHealthCheck() {
        log.info("Backend scheduler heartbeat for ViralPe.");
    }
}
