package com.viralpe.royalty.controller;

import com.viralpe.royalty.dto.VendorRoyaltyHistoryItemResponse;
import com.viralpe.royalty.dto.VendorRoyaltyHistoryResponse;
import com.viralpe.royalty.model.VendorRoyaltyLedger;
import com.viralpe.royalty.service.VendorRoyaltyService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendor-royalties")
public class VendorRoyaltyController {

    private final VendorRoyaltyService vendorRoyaltyService;

    public VendorRoyaltyController(VendorRoyaltyService vendorRoyaltyService) {
        this.vendorRoyaltyService = vendorRoyaltyService;
    }

    @GetMapping("/vendor/{vendorId}")
    public VendorRoyaltyHistoryResponse getVendorHistory(@PathVariable Long vendorId) {

        List<VendorRoyaltyLedger> records =
                vendorRoyaltyService.getVendorHistory(vendorId);

        return buildResponse(records);
    }

    @GetMapping("/user/{userId}")
    public VendorRoyaltyHistoryResponse getUserHistory(@PathVariable Long userId) {

        List<VendorRoyaltyLedger> records =
                vendorRoyaltyService.getUserHistory(userId);

        return buildResponse(records);
    }

    @GetMapping("/pincode/{pincode}")
    public VendorRoyaltyHistoryResponse getPincodeHistory(
            @PathVariable String pincode) {

        List<VendorRoyaltyLedger> records =
                vendorRoyaltyService.getPincodeHistory(pincode);

        return buildResponse(records);
    }

    @GetMapping
    public VendorRoyaltyHistoryResponse getAllHistory() {

        List<VendorRoyaltyLedger> records =
                vendorRoyaltyService.getAllHistory();

        return buildResponse(records);
    }

    private VendorRoyaltyHistoryResponse buildResponse(
            List<VendorRoyaltyLedger> records) {

        List<VendorRoyaltyHistoryItemResponse> items = records.stream()
                .map(this::map)
                .collect(Collectors.toList());

        BigDecimal total = records.stream()
                .map(VendorRoyaltyLedger::getRoyaltyAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        VendorRoyaltyHistoryResponse response =
                new VendorRoyaltyHistoryResponse();

        response.setTotalRoyaltyEarned(total);
        response.setHistory(items);

        return response;
    }

    private VendorRoyaltyHistoryItemResponse map(
            VendorRoyaltyLedger ledger) {

        VendorRoyaltyHistoryItemResponse item =
                new VendorRoyaltyHistoryItemResponse();

        item.setId(ledger.getId());
        item.setVendorId(ledger.getVendorId());
        item.setUserId(ledger.getUserId());
        item.setTransactionId(ledger.getTransactionId());
        item.setRoyaltyAmount(ledger.getRoyaltyAmount());
        item.setRunningTotal(ledger.getRunningTotal());
        item.setTransactionType(ledger.getTransactionType());
        item.setBusinessPincode(ledger.getBusinessPincode());
        item.setCreatedAt(ledger.getCreatedAt());

        return item;
    }
}