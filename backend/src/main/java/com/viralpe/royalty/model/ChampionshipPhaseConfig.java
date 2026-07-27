package com.viralpe.royalty.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "championship_phase_config")
public class ChampionshipPhaseConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "active_phase", nullable = false)
    private String activePhase = "DAILY";

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivePhase() {
        return activePhase;
    }

    public void setActivePhase(String activePhase) {
        this.activePhase = activePhase;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
