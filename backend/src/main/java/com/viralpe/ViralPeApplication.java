package com.viralpe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.viralpe")
@EntityScan(basePackages = "com.viralpe")
public class ViralPeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ViralPeApplication.class, args);
    }
}