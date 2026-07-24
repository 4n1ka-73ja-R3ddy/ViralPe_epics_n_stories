package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.CashbackLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface CashbackLedgerRepository
        extends JpaRepository<CashbackLedger, Long> {

    List<CashbackLedger>
    findByUserIdOrderByCreatedAtDesc(Long userId);

    List<CashbackLedger>
    findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId,
            OffsetDateTime startDate,
            OffsetDateTime endDate
    );
}