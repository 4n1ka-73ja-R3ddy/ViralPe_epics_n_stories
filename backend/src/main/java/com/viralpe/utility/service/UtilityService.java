package com.viralpe.utility.service;

import com.viralpe.utility.dto.RechargeRequest;
import com.viralpe.utility.dto.RechargeResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UtilityService {

    public UtilityService() {
    }

    public RechargeResponse performRecharge(RechargeRequest request) {
        // For now simulate a checkout using wallet + gateway via PaymentService
        // In real code, call checkout flow. Here we pretend success.
        String ref = "RCG-" + UUID.randomUUID();
        return new RechargeResponse("SUCCESS", ref);
    }
}
