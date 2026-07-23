package com.viralpe.wallet.repository;

import com.viralpe.wallet.model.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface LedgerEntryRepository
// developed by anika teja reddy
        extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<LedgerEntry>
    findByUserIdAndCategoryInOrderByCreatedAtDesc(
            Long userId,
            Collection<String> categories
    );
}