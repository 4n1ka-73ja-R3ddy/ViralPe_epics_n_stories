package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.ChampionshipPhaseConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChampionshipPhaseConfigRepository extends JpaRepository<ChampionshipPhaseConfig, Long> {
    Optional<ChampionshipPhaseConfig> findFirstByOrderByIdAsc();
}
