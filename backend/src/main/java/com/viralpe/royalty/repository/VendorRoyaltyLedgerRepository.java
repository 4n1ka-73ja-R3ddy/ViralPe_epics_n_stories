package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.VendorRoyaltyLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorRoyaltyLedgerRepository
        extends JpaRepository<VendorRoyaltyLedger, Long> {

    List<VendorRoyaltyLedger> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    List<VendorRoyaltyLedger> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<VendorRoyaltyLedger> findByBusinessPincodeOrderByCreatedAtDesc(String businessPincode);

    List<VendorRoyaltyLedger> findAllByOrderByCreatedAtDesc();
}

