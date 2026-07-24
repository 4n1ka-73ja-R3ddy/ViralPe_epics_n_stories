package com.viralpe.vendor.repository;

import com.viralpe.vendor.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByOnboardedByUserId(Long onboardedByUserId);

}