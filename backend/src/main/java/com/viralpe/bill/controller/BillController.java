package com.viralpe.bill.controller;

import com.viralpe.bill.dto.BillCategoryResponse;
import com.viralpe.bill.dto.BillFetchRequest;
import com.viralpe.bill.dto.BillFetchResponse;
import com.viralpe.bill.dto.BillerResponse;
import com.viralpe.bill.dto.BillPaymentRequest;
import com.viralpe.bill.dto.BillReceiptResponse;
import com.viralpe.bill.model.BillPayment;
import com.viralpe.bill.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bill")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<BillCategoryResponse>> getCategories() {
        return ResponseEntity.ok(billService.getCategories());
    }

    @GetMapping("/billers")
    public ResponseEntity<List<BillerResponse>> getBillers(
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(billService.getBillers(category));
    }
// developed by anika teja reddy

    @PostMapping("/fetch")
    public ResponseEntity<BillFetchResponse> fetchBill(
            @RequestBody BillFetchRequest request
    ) {
        return ResponseEntity.ok(billService.fetchBill(request));
    }

    @PostMapping("/pay")
    public ResponseEntity<BillReceiptResponse> payBill(
            @RequestBody BillPaymentRequest request
    ) {
        return ResponseEntity.ok(billService.payBill(request));
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<BillPayment> getStatus(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(billService.getStatus(id));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<BillPayment>> getHistory(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(billService.getHistory(userId));
    }

    @GetMapping("/receipt/{id}")
    public ResponseEntity<BillReceiptResponse> getReceipt(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(billService.getReceipt(id));
    }
}