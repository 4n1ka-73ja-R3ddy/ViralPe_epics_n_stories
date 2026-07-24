package com.viralpe.payment.service;

import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    // Mock payment provider integration
    public boolean processPayment(Double amount, String provider) {
        // In real integration, route to UPI/Card/Gateway SDK
        return true; // always succeed in mock
    }

    public String getPaymentStatus() {
        return "Payment service skeleton is initialized.";
    }
}
