package com.viralpe.recharge.service;

import com.viralpe.recharge.dto.RechargeOperatorResponse;
import com.viralpe.recharge.dto.RechargePlanResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RechargeProviderService {

    public List<RechargeOperatorResponse> getOperators() {

        return List.of(

                new RechargeOperatorResponse(
                        "JIO",
                        "Reliance Jio"
                ),

                new RechargeOperatorResponse(
                        "AIRTEL",
                        "Airtel"
                ),

                new RechargeOperatorResponse(
                        "VI",
                        "Vodafone Idea"
                ),

                new RechargeOperatorResponse(
                        "BSNL",
                        "BSNL"
                )
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

    public List<RechargePlanResponse> getPlans(
            String operatorCode,
            String circle
    ) {

        if (operatorCode == null || operatorCode.isBlank()) {
            throw new IllegalArgumentException("Operator code is required.");
        }

        if (circle == null || circle.isBlank()) {
            throw new IllegalArgumentException("Circle is required.");
        }

        String operator = operatorCode.trim().toUpperCase();

        switch (operator) {

            case "JIO":
                return List.of(

                        new RechargePlanResponse(
                                1L,
                                "JIO",
                                circle,
                                239.0,
                                "22 Days",
                                "1.5 GB/day + Unlimited Calls"
                        ),

                        new RechargePlanResponse(
                                2L,
                                "JIO",
                                circle,
                                299.0,
                                "28 Days",
                                "2 GB/day + Unlimited Calls"
                        ),

                        new RechargePlanResponse(
                                3L,
                                "JIO",
                                circle,
                                749.0,
                                "72 Days",
                                "2 GB/day + Unlimited Calls"
                        )
                );

            case "AIRTEL":
                return List.of(

                        new RechargePlanResponse(
                                4L,
                                "AIRTEL",
                                circle,
                                199.0,
                                "28 Days",
                                "2 GB Total + Unlimited Calls"
                        ),

                        new RechargePlanResponse(
                                5L,
                                "AIRTEL",
                                circle,
                                349.0,
                                "28 Days",
                                "1.5 GB/day + Unlimited Calls"
                        )
                );

            case "VI":
                return List.of(

                        new RechargePlanResponse(
                                6L,
                                "VI",
                                circle,
                                299.0,
                                "28 Days",
                                "1 GB/day + Unlimited Calls"
                        ),

                        new RechargePlanResponse(
                                7L,
                                "VI",
                                circle,
                                365.0,
                                "28 Days",
                                "2 GB/day + Unlimited Calls"
                        )
                );

            case "BSNL":
                return List.of(

                        new RechargePlanResponse(
                                8L,
                                "BSNL",
                                circle,
                                107.0,
                                "35 Days",
                                "3 GB Total + 200 Minutes"
                        ),

                        new RechargePlanResponse(
                                9L,
                                "BSNL",
                                circle,
                                199.0,
                                "30 Days",
                                "2 GB/day + Unlimited Calls"
                        )
                );

            default:
                throw new IllegalArgumentException(
                        "Unsupported operator."
                );

        }

    }

    public String performRecharge(
            String mobileNumber,
            Double amount
    ) {

        return "RCHG-" + System.currentTimeMillis();
    }

}