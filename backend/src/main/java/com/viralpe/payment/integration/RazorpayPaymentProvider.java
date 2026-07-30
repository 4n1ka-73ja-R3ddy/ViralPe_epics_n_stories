package com.viralpe.payment.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RazorpayPaymentProvider implements PaymentProvider {

    @Value("${razorpay.key_id:rzp_test_TIWpw5hrzzlXzV}")
    private String keyId;

    @Override
    public String getProviderName() {
        return "RAZORPAY";
    }

    @Override
    public boolean processPayment(Double amount) {
        // Razorpay Gateway test mode validation
        return amount != null && amount > 0;
    }

    public String getKeyId() {
        return keyId;
    }
}
