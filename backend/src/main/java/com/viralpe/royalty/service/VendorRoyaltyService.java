package com.viralpe.royalty.service;

import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.model.VendorRoyaltyLedger;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.royalty.repository.VendorRoyaltyLedgerRepository;
import com.viralpe.vendor.model.Vendor;
import com.viralpe.vendor.repository.VendorRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class VendorRoyaltyService {

    private final VendorRepository vendorRepository;
    private final VendorRoyaltyLedgerRepository ledgerRepository;
    private final RoyaltyConfigurationRepository royaltyConfigurationRepository;
    private final WalletService walletService;

    public VendorRoyaltyService(
            VendorRepository vendorRepository,
            VendorRoyaltyLedgerRepository ledgerRepository,
            RoyaltyConfigurationRepository royaltyConfigurationRepository,
            WalletService walletService) {

        this.vendorRepository = vendorRepository;
        this.ledgerRepository = ledgerRepository;
        this.royaltyConfigurationRepository = royaltyConfigurationRepository;
        this.walletService = walletService;
    }

    @Transactional
    public BigDecimal creditRoyalty(
            Long vendorId,
            Long transactionId,
            Double transactionAmount,
            String transactionType) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Vendor not found"));

        RoyaltyConfiguration configuration =
                royaltyConfigurationRepository.findAll()
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new IllegalStateException("Royalty configuration not found"));

        BigDecimal amount = BigDecimal.valueOf(transactionAmount);

        BigDecimal profitMarginPercent =
                BigDecimal.valueOf(
                        configuration.getProfitMarginPercentage() == null
                                ? 0.0
                                : configuration.getProfitMarginPercentage());

        BigDecimal vendorRoyaltyPercent =
                BigDecimal.valueOf(
                        configuration.getVendorRoyaltyPercentage() == null
                                ? 0.0
                                : configuration.getVendorRoyaltyPercentage());

        BigDecimal deductionFraction =
                BigDecimal.valueOf(
                        configuration.getPincodeDeductionFraction() == null
                                ? 0.0
                                : configuration.getPincodeDeductionFraction());

        BigDecimal profit = amount
                .multiply(profitMarginPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal royalty = profit
                .multiply(vendorRoyaltyPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal deduction = royalty
                .multiply(deductionFraction);

        royalty = royalty.subtract(deduction);

        if (royalty.compareTo(BigDecimal.ZERO) < 0) {
            royalty = BigDecimal.ZERO;
        }

        List<VendorRoyaltyLedger> history =
                ledgerRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);

        BigDecimal runningTotal = royalty;

        if (!history.isEmpty()) {
            runningTotal =
                    history.get(0).getRunningTotal().add(royalty);
        }

        walletService.creditWalletBalance(
                vendor.getOnboardedByUserId(),
                royalty.doubleValue(),
                "vendor_royalty",
                transactionId.toString()
        );

        VendorRoyaltyLedger ledger = new VendorRoyaltyLedger();

        ledger.setVendorId(vendorId);
        ledger.setUserId(vendor.getOnboardedByUserId());
        ledger.setTransactionId(transactionId);
        ledger.setRoyaltyAmount(royalty);
        ledger.setRunningTotal(runningTotal);
        ledger.setTransactionType(transactionType);
        ledger.setBusinessPincode(vendor.getBusinessPincode());
        ledger.setCreatedAt(OffsetDateTime.now());

        ledgerRepository.save(ledger);

        return royalty;
    }

    public List<VendorRoyaltyLedger> getVendorHistory(Long vendorId) {
        return ledgerRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    public List<VendorRoyaltyLedger> getUserHistory(Long userId) {
        return ledgerRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<VendorRoyaltyLedger> getPincodeHistory(String pincode) {
        return ledgerRepository.findByBusinessPincodeOrderByCreatedAtDesc(pincode);
    }

    public List<VendorRoyaltyLedger> getAllHistory() {
        return ledgerRepository.findAllByOrderByCreatedAtDesc();
    }
}