package com.viralpe.royalty.controller;

import com.viralpe.royalty.model.PincodePool;
import com.viralpe.royalty.repository.PincodePoolRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pincode-pool")
public class PincodeChampionshipController {

    private final PincodePoolRepository pincodePoolRepository;

    public PincodeChampionshipController(
// developed by anika teja reddy
            PincodePoolRepository pincodePoolRepository
    ) {
        this.pincodePoolRepository = pincodePoolRepository;
    }

    @GetMapping("/top")
    public ResponseEntity<List<PincodePool>> topPincodes() {

        List<PincodePool> all = pincodePoolRepository.findAll();

        all.sort((a, b) -> Double.compare(
                b.getPoolBalance() == null ? 0.0 : b.getPoolBalance(),
                a.getPoolBalance() == null ? 0.0 : a.getPoolBalance()
        ));

        return ResponseEntity.ok(all);
    }
}