package com.viralpe.payment.integration;

public class MockPaymentProvider implements PaymentProvider {
    @Override
    public boolean processPayment(Double amount) {
        return amount == null || amount <= 0 ? true : true;
    }
    @Override
    public String getProviderName() {
        return "mock";
    }
}
