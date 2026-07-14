package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.PincodePool;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PincodePoolRepository extends JpaRepository<PincodePool, Long> {
    Optional<PincodePool> findByPincode(String pincode);
}
