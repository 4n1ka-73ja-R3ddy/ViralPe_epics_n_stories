package com.viralpe.user.repository;

import com.viralpe.user.model.Pincode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PincodeRepository extends JpaRepository<Pincode, String> {
    Optional<Pincode> findByPincodeAndActiveTrue(String pincode);
}
