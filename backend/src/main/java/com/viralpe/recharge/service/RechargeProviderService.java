package com.viralpe.recharge.service;

import com.viralpe.integration.cyrus.CyrusApiClient;
import com.viralpe.recharge.dto.RechargeOperatorResponse;
import com.viralpe.recharge.dto.RechargePlanResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RechargeProviderService {

    private final CyrusApiClient cyrusApiClient;

    public RechargeProviderService(CyrusApiClient cyrusApiClient) {
        this.cyrusApiClient = cyrusApiClient;
    }

    public Map<String, String> lookupMnp(String mobileNumber) {
        return cyrusApiClient.fetchOperatorCircle(mobileNumber);
    }

    public List<RechargeOperatorResponse> getOperators() {
        return List.of(
                new RechargeOperatorResponse("JIO", "Reliance Jio"),
                new RechargeOperatorResponse("AIRTEL", "Airtel"),
                new RechargeOperatorResponse("VI", "Vodafone Idea"),
                new RechargeOperatorResponse("BSNL", "BSNL")
        );
    }

    public List<String> getCircles() {
        return List.of(
                "Andhra Pradesh",
                "Telangana",
                "Karnataka",
                "Tamil Nadu",
                "Kerala",
                "Maharashtra",
                "Delhi",
                "Gujarat"
        );
    }

    public List<RechargePlanResponse> getPlans(String operatorCode, String circle) {
        if (operatorCode == null || operatorCode.isBlank()) {
            throw new IllegalArgumentException("Operator code is required.");
        }
        if (circle == null || circle.isBlank()) {
            throw new IllegalArgumentException("Circle is required.");
        }

        List<Map<String, Object>> cyrusPlans = cyrusApiClient.fetchRechargePlans(operatorCode, circle, "9876543210");
        return cyrusPlans.stream().map(p -> new RechargePlanResponse(
                ((Number) p.get("id")).longValue(),
                operatorCode,
                circle,
                ((Number) p.get("amount")).doubleValue(),
                (String) p.get("validity"),
                (String) p.get("description")
        )).toList();
    }

    public String performRecharge(String mobileNumber, Double amount) {
        Map<String, Object> result = cyrusApiClient.executeRecharge(mobileNumber, "JIO", "Karnataka", amount, "TX-" + System.currentTimeMillis());
        return (String) result.getOrDefault("providerReference", "RCHG-" + System.currentTimeMillis());
    }

    public Map<String, Object> performFullRecharge(String mobileNumber, String operatorCode, String circle, Double amount, String userTxId) {
        return cyrusApiClient.executeRecharge(mobileNumber, operatorCode, circle, amount, userTxId);
    }
}