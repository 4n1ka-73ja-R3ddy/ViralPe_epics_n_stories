package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.RoyaltyConfigurationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoyaltyConfigurationHistoryRepository extends JpaRepository<RoyaltyConfigurationHistory, Long> {
    List<RoyaltyConfigurationHistory> findAllByOrderByCreatedAtDesc();
}
