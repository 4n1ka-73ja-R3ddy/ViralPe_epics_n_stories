package com.viralpe.bill.integration;

import com.viralpe.bill.dto.BillCategoryResponse;
import com.viralpe.bill.dto.BillFetchRequest;
import com.viralpe.bill.dto.BillFetchResponse;
import com.viralpe.bill.dto.BillerResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BillProviderService {

    public List<BillCategoryResponse> getCategories() {

        return List.of(
                new BillCategoryResponse("ELECTRICITY", "Electricity"),
                new BillCategoryResponse("WATER", "Water"),
                new BillCategoryResponse("GAS", "Gas"),
                new BillCategoryResponse("BROADBAND", "Broadband"),
                new BillCategoryResponse("DTH", "DTH")
        );
    }

    public List<BillerResponse> getBillers() {

        return List.of(
                new BillerResponse("BESCOM", "BESCOM", "ELECTRICITY"),
                new BillerResponse("BWSSB", "BWSSB", "WATER"),
                new BillerResponse("ACT", "ACT Broadband", "BROADBAND"),
                new BillerResponse("AIRTEL_BB", "Airtel Broadband", "BROADBAND"),
                new BillerResponse("INDANE", "Indane Gas", "GAS")
// developed by anika teja reddy
        );
    }

    public BillFetchResponse fetchBill(BillFetchRequest request) {

        BillFetchResponse response = new BillFetchResponse();

        response.setBillerId(request.getBillerId());
        response.setBillerName(request.getBillerId());
        response.setConsumerNumber(request.getConsumerNumber());
        response.setCustomerName("Demo Customer");
        response.setAmount(850.00);
        response.setDueDate("2026-08-15");
        response.setBillReference(UUID.randomUUID().toString());

        return response;
    }

    public boolean payBill(String billReference, Double amount) {

        // Mock BBPS Provider
        return true;
    }

    public String generateProviderReference() {

        return "BBPS-" + UUID.randomUUID();
    }

    public String generateReceiptNumber() {

        return "RCPT-" + UUID.randomUUID();
    }
}