package com.viralpe.referral.controller;

import com.viralpe.referral.dto.ReferralEarningsHistoryResponse;
import com.viralpe.referral.service.ReferralService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/referral")
public class ReferralController {

    private final ReferralService referralService;

    public ReferralController(ReferralService referralService) {
        this.referralService = referralService;
    }

    @GetMapping("/history/{referrerUserId}")
    public ResponseEntity<ReferralEarningsHistoryResponse> getHistory(
            @PathVariable Long referrerUserId) {

        return ResponseEntity.ok(
                referralService.getHistory(referrerUserId)
        );
    }

    @GetMapping("/history/{referrerUserId}/filter")
    public ResponseEntity<ReferralEarningsHistoryResponse> getHistoryByDate(
            @PathVariable Long referrerUserId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime startDate,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime endDate) {

        return ResponseEntity.ok(
                referralService.getHistory(
                        referrerUserId,
                        startDate,
                        endDate
                )
        );
    }
}