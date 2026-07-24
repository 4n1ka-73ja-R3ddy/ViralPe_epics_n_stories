package com.viralpe.royalty.controller;

import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/royalty")
public class RoyaltyAdminController {

    private final RoyaltyConfigurationRepository royaltyConfigRepo;

    public RoyaltyAdminController(RoyaltyConfigurationRepository royaltyConfigRepo) {
        this.royaltyConfigRepo = royaltyConfigRepo;
    }

    @GetMapping
    public List<RoyaltyConfiguration> list() {
        return royaltyConfigRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<RoyaltyConfiguration> createOrUpdate(@RequestBody RoyaltyConfiguration cfg) {
        RoyaltyConfiguration saved = royaltyConfigRepo.save(cfg);
        return ResponseEntity.ok(saved);
    }
}
