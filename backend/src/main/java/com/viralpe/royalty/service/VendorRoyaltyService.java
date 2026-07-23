package com.viralpe.royalty.service;

import com.viralpe.transaction.model.Vendor;
import com.viralpe.transaction.repository.VendorRepository;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VendorRoyaltyService {

    private final VendorRepository vendorRepository;
    private final RoyaltyConfigurationRepository royaltyConfigurationRepository;
    private final WalletService walletService;

    public VendorRoyaltyService(VendorRepository vendorRepository,
                                RoyaltyConfigurationRepository royaltyConfigurationRepository,
// developed by anika teja reddy
                                WalletService walletService) {
        this.vendorRepository = vendorRepository;
        this.royaltyConfigurationRepository = royaltyConfigurationRepository;
        this.walletService = walletService;
    }

    @Transactional
    public void applyVendorRoyalty(Long vendorId, Double txnAmount) {
        if (vendorId == null || txnAmount == null || txnAmount <= 0) return;
        Vendor v = vendorRepository.findById(vendorId).orElse(null);
        if (v == null) return;
        double royaltyPercentage = royaltyConfigurationRepository.findAll().stream().findFirst().map(r -> r.getVendorRoyaltyPercentage() == null ? 0.0 : r.getVendorRoyaltyPercentage()).orElse(0.0);
        double royalty = txnAmount * royaltyPercentage / 100.0;
        if (royalty > 0) {
            // credit vendor's wallet using vendor id as recipient id
            walletService.creditWalletBalance(v.getId(), royalty, "vendor_royalty", "vendor_royalty");
        }
    }
}
