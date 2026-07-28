package com.viralpe.bill.integration;

import com.viralpe.bill.dto.BillCategoryResponse;
import com.viralpe.bill.dto.BillFetchRequest;
import com.viralpe.bill.dto.BillFetchResponse;
import com.viralpe.bill.dto.BillerResponse;
import com.viralpe.integration.cyrus.CyrusApiClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BillProviderService {

    private final CyrusApiClient cyrusApiClient;

    public BillProviderService(CyrusApiClient cyrusApiClient) {
        this.cyrusApiClient = cyrusApiClient;
    }

    public List<BillCategoryResponse> getCategories() {
        return List.of(
                new BillCategoryResponse("ELECTRICITY", "Electricity ⚡"),
                new BillCategoryResponse("WATER", "Water 💧"),
                new BillCategoryResponse("GAS", "Gas 🔥"),
                new BillCategoryResponse("BROADBAND", "Broadband 🌐"),
                new BillCategoryResponse("DTH", "DTH 📺")
        );
    }

    public List<BillerResponse> getBillers() {
        return List.of(
                new BillerResponse("BESCOM", "BESCOM Electricity", "ELECTRICITY"),
                new BillerResponse("BWSSB", "BWSSB Water Supply", "WATER"),
                new BillerResponse("ACT", "ACT Fibernet Broadband", "BROADBAND"),
                new BillerResponse("AIRTEL_BB", "Airtel Xstream Broadband", "BROADBAND"),
                new BillerResponse("INDANE", "Indane LPG Gas", "GAS")
        );
    }

    public BillFetchResponse fetchBill(BillFetchRequest request) {
        Map<String, Object> cyrusDetails = cyrusApiClient.fetchBillDetails(request.getBillerId(), request.getConsumerNumber());

        BillFetchResponse response = new BillFetchResponse();
        response.setBillerId(request.getBillerId());
        response.setBillerName((String) cyrusDetails.getOrDefault("billerName", request.getBillerId()));
        response.setConsumerNumber(request.getConsumerNumber());
        response.setCustomerName((String) cyrusDetails.getOrDefault("customerName", "Valued Customer"));
        response.setAmount(((Number) cyrusDetails.getOrDefault("amount", 850.00)).doubleValue());
        response.setDueDate((String) cyrusDetails.getOrDefault("dueDate", "2026-08-15"));
        response.setBillReference((String) cyrusDetails.getOrDefault("billReference", "BBPS-" + UUID.randomUUID()));

        return response;
    }

    public boolean payBill(String billReference, Double amount) {
        Map<String, Object> payResult = cyrusApiClient.executeBillPayment("BESCOM", billReference, amount, "TX-BILL-" + System.currentTimeMillis());
        return "SUCCESS".equalsIgnoreCase((String) payResult.get("status"));
    }

    public String generateProviderReference() {
        return "BBPS-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
    }

    public String generateReceiptNumber() {
        return "RCPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}