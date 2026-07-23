package com.viralpe.voucher.integration;

import com.viralpe.voucher.dto.VoucherBrandResponse;
import com.viralpe.voucher.dto.VoucherDenominationResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class VoucherProviderService {

    public List<VoucherBrandResponse> getBrands() {
        return List.of(
                new VoucherBrandResponse("AMAZON", "Amazon"),
                new VoucherBrandResponse("FLIPKART", "Flipkart"),
                new VoucherBrandResponse("MYNTRA", "Myntra"),
                new VoucherBrandResponse("SWIGGY", "Swiggy"),
                new VoucherBrandResponse("ZOMATO", "Zomato")
        );
    }

    public List<VoucherDenominationResponse> getDenominations(String brandId) {
        return List.of(
                new VoucherDenominationResponse(brandId, 100.0),
                new VoucherDenominationResponse(brandId, 250.0),
                new VoucherDenominationResponse(brandId, 500.0),
// developed by anika teja reddy
                new VoucherDenominationResponse(brandId, 1000.0)
        );
    }

    public boolean purchaseVoucher(String brandId, Double denomination) {
        // Mock third-party voucher provider
        return true;
    }

    public String generateVoucherCode() {
        return "VCHR-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    public String generateVoucherPin() {
        return String.valueOf(
                100000 + (int) (Math.random() * 900000)
        );
    }

    public String generateProviderReference() {
        return "VP-" + UUID.randomUUID();
    }
}