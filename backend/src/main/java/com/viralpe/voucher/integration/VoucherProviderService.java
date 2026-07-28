package com.viralpe.voucher.integration;

import com.viralpe.integration.cyrus.CyrusApiClient;
import com.viralpe.voucher.dto.VoucherBrandResponse;
import com.viralpe.voucher.dto.VoucherDenominationResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class VoucherProviderService {

    private final CyrusApiClient cyrusApiClient;

    public VoucherProviderService(CyrusApiClient cyrusApiClient) {
        this.cyrusApiClient = cyrusApiClient;
    }

    public List<VoucherBrandResponse> getBrands() {
        List<Map<String, Object>> cyrusBrands = cyrusApiClient.fetchVoucherBrands();
        return cyrusBrands.stream().map(b -> new VoucherBrandResponse(
                (String) b.get("id"),
                (String) b.get("name")
        )).toList();
    }

    public List<VoucherDenominationResponse> getDenominations(String brandId) {
        return List.of(
                new VoucherDenominationResponse(brandId, 100.0),
                new VoucherDenominationResponse(brandId, 250.0),
                new VoucherDenominationResponse(brandId, 500.0),
                new VoucherDenominationResponse(brandId, 1000.0),
                new VoucherDenominationResponse(brandId, 2000.0)
        );
    }

    public Map<String, Object> purchaseVoucherOrder(String brandId, Double denomination, String userTxId, String email, String phone) {
        return cyrusApiClient.executeVoucherOrder(brandId, denomination, userTxId, email, phone);
    }

    public boolean purchaseVoucher(String brandId, Double denomination) {
        Map<String, Object> res = cyrusApiClient.executeVoucherOrder(brandId, denomination, "TX-GFT-" + System.currentTimeMillis(), "user@viralpe.com", "9876543210");
        return "SUCCESS".equalsIgnoreCase((String) res.get("status"));
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
        return "CYR-GFT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}