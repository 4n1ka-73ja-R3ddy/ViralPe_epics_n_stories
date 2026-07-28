package com.viralpe.voucher.controller;

import com.viralpe.voucher.dto.VoucherBrandResponse;
import com.viralpe.voucher.dto.VoucherDenominationResponse;
import com.viralpe.voucher.dto.VoucherPurchaseRequest;
import com.viralpe.voucher.dto.VoucherPurchaseResponse;
import com.viralpe.voucher.model.VoucherPurchase;
import com.viralpe.voucher.service.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/voucher")
@Tag(name = "7. Digital Vouchers (Cyrus API)", description = "Brand gift cards, denominations, instant code/PIN reveal, and voucher history")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping("/brands")
    public ResponseEntity<List<VoucherBrandResponse>> getBrands() {
        return ResponseEntity.ok(voucherService.getBrands());
    }

    @GetMapping("/denominations")
    public ResponseEntity<List<VoucherDenominationResponse>> getDenominations(
            @RequestParam String brandId) {

        return ResponseEntity.ok(
                voucherService.getDenominations(brandId)
        );
    }

    @PostMapping("/purchase")
    public ResponseEntity<VoucherPurchaseResponse> purchaseVoucher(
            @RequestBody VoucherPurchaseRequest request) {

        return ResponseEntity.ok(
                voucherService.purchaseVoucher(request)
        );
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<VoucherPurchase> getStatus(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                voucherService.getStatus(id)
        );
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<VoucherPurchase>> getHistory(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                voucherService.getHistory(userId)
        );
    }
}