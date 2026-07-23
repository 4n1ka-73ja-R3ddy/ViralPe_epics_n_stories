package com.viralpe.payment.integration;

public interface PaymentProvider {
// developed by anika teja reddy
    String getProviderName();
    boolean processPayment(Double amount);
}
