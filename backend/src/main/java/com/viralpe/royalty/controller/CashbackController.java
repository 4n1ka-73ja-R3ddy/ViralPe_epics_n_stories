package com.viralpe.royalty.controller;

import com.viralpe.royalty.dto.CashbackHistoryResponse;
import com.viralpe.royalty.service.CashbackService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/cashback")
public class CashbackController {

    private final CashbackService cashbackService;

    public CashbackController(CashbackService cashbackService) {
        this.cashbackService = cashbackService;
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<CashbackHistoryResponse> getHistory(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                cashbackService.getHistory(userId)
        );
    }

    @GetMapping("/history/{userId}/filter")
    public ResponseEntity<CashbackHistoryResponse> getHistoryByDate(
            @PathVariable Long userId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime startDate,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime endDate) {

        return ResponseEntity.ok(
                cashbackService.getHistory(
                        userId,
                        startDate,
                        endDate
                )
        );
    }
}