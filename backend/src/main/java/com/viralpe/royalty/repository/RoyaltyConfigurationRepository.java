package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.RoyaltyConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoyaltyConfigurationRepository extends JpaRepository<RoyaltyConfiguration, Long> {

    Optional<RoyaltyConfiguration> findByCategory(String category);
}
