package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.PincodeRoyaltyLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PincodeRoyaltyLedgerRepository
        extends JpaRepository<PincodeRoyaltyLedger, Long> {
}
