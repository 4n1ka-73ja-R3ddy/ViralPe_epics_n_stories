package com.viralpe.payment.controller;

import com.viralpe.payment.dto.RazorpayOrderRequest;
import com.viralpe.payment.dto.RazorpayOrderResponse;
import com.viralpe.payment.dto.RazorpayVerificationRequest;
import com.viralpe.payment.dto.RazorpayVerificationResponse;
import com.viralpe.payment.service.RazorpayService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/razorpay")
public class RazorpayController {

    private final RazorpayService razorpayService;

    public RazorpayController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of(
                "keyId", razorpayService.getKeyId(),
                "status", "ACTIVE",
                "mode", "TEST"
        ));
    }

    @PostMapping("/create-order")
    public ResponseEntity<RazorpayOrderResponse> createOrder(@Valid @RequestBody RazorpayOrderRequest request) {
        RazorpayOrderResponse response = razorpayService.createOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<RazorpayVerificationResponse> verifyPayment(@Valid @RequestBody RazorpayVerificationRequest request) {
        RazorpayVerificationResponse response = razorpayService.verifyAndProcessPayment(request);
        return ResponseEntity.ok(response);
    }
}
