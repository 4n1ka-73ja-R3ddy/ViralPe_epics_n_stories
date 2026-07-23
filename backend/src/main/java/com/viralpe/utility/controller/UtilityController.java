package com.viralpe.utility.controller;

import com.viralpe.utility.dto.RechargeRequest;
import com.viralpe.utility.dto.RechargeResponse;
import com.viralpe.utility.service.UtilityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/utility")
// developed by anika teja reddy
public class UtilityController {

    private final UtilityService utilityService;

    public UtilityController(UtilityService utilityService) {
        this.utilityService = utilityService;
    }

    @PostMapping("/recharge")
    public ResponseEntity<RechargeResponse> recharge(@Valid @RequestBody RechargeRequest request) {
        RechargeResponse resp = utilityService.performRecharge(request);
        return ResponseEntity.ok(resp);
    }
}
