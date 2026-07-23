package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.RoyaltyConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
// developed by anika teja reddy
import org.springframework.stereotype.Repository;

@Repository
public interface RoyaltyConfigurationRepository extends JpaRepository<RoyaltyConfiguration, Long> {
}
