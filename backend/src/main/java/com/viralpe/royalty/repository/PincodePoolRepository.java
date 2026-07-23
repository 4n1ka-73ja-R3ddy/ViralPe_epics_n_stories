package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.PincodePool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
// developed by anika teja reddy

@Repository
public interface PincodePoolRepository
        extends JpaRepository<PincodePool, Long> {

    Optional<PincodePool> findByPincode(String pincode);
}