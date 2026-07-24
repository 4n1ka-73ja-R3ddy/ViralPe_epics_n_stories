package com.viralpe.payment.integration;

public interface PaymentProvider {
    String getProviderName();
    boolean processPayment(Double amount);
}
