package com.viralpe.payment.controller;

import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.dto.CheckoutResponse;
import com.viralpe.payment.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.viralpe.integration.orchestration.IdempotencyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final IdempotencyService idempotencyService;

    public CheckoutController(CheckoutService checkoutService, IdempotencyService idempotencyService) {
        this.checkoutService = checkoutService;
        this.idempotencyService = idempotencyService;
    }

    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CheckoutRequest request
    ) {
        String effectiveKey = StringUtils.hasText(idempotencyKey)
                ? idempotencyKey.trim()
                : (request != null && request.getUserId() != null && request.getAmount() != null
                    ? "CHK:" + request.getUserId() + ":" + request.getProvider() + ":" + request.getAmount()
                    : null);

        if (effectiveKey != null && idempotencyService.isProcessed(effectiveKey)) {
            CheckoutResponse existing = idempotencyService.getExistingResponse(effectiveKey, CheckoutResponse.class);
            if (existing != null) {
                return ResponseEntity.ok(existing);
            }
        }

        CheckoutResponse resp = checkoutService.processCheckout(request);
        if (effectiveKey != null) {
            idempotencyService.recordResponse(effectiveKey, resp);
        }

        return ResponseEntity.ok(resp);
    }
}
