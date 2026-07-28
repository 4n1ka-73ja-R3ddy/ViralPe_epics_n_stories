package com.viralpe.recharge.controller;

import com.viralpe.recharge.dto.RechargeOperatorResponse;
import com.viralpe.recharge.dto.RechargePlanResponse;
import com.viralpe.recharge.dto.RechargePreviewResponse;
import com.viralpe.recharge.dto.RechargeRequest;
import com.viralpe.recharge.model.RechargeTransaction;
import com.viralpe.recharge.service.RechargeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/recharge")
@Tag(name = "5. Mobile Recharge (Cyrus API)", description = "MNP operator lookup, plan fetching, and mobile recharge execution via Cyrus API")
public class RechargeController {

    private final RechargeService rechargeService;

    public RechargeController(
            RechargeService rechargeService
    ) {
        this.rechargeService = rechargeService;
    }

    @GetMapping("/mnp")
    public ResponseEntity<java.util.Map<String, String>> lookupMnp(@RequestParam String mobileNumber) {
        return ResponseEntity.ok(rechargeService.lookupMnp(mobileNumber));
    }

    @GetMapping("/operators")
    public ResponseEntity<List<RechargeOperatorResponse>> getOperators() {

        return ResponseEntity.ok(
                rechargeService.getOperators()
        );
    }

    @GetMapping("/circles")
    public ResponseEntity<List<String>> getCircles() {

        return ResponseEntity.ok(
                rechargeService.getCircles()
        );
    }

    @GetMapping("/plans")
    public ResponseEntity<List<RechargePlanResponse>> getPlans(
            @RequestParam String operatorCode,
            @RequestParam String circle
    ) {

        return ResponseEntity.ok(
                rechargeService.getPlans(
                        operatorCode,
                        circle
                )
        );
    }

    @PostMapping("/preview")
    public ResponseEntity<RechargePreviewResponse> previewRecharge(
            @RequestBody RechargeRequest request
    ) {

        return ResponseEntity.ok(
                rechargeService.previewRecharge(
                        request
                )
        );
    }

    @PostMapping
    public ResponseEntity<RechargeTransaction> recharge(
            @RequestBody RechargeRequest request
    ) {

        return ResponseEntity.ok(
                rechargeService.recharge(
                        request
                )
        );
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<RechargeTransaction> getStatus(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                rechargeService.getStatus(id)
        );
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<RechargeTransaction>> getHistory(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                rechargeService.getHistory(userId)
        );
    }

}