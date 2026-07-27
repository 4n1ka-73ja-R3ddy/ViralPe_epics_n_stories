package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.PincodePool;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PincodePoolRepository
        extends JpaRepository<PincodePool, Long> {

    Optional<PincodePool> findByPincode(String pincode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PincodePool p where p.pincode = :pincode")
    Optional<PincodePool> findByPincodeForUpdate(@Param("pincode") String pincode);

    List<PincodePool> findByCurrentCyclePoolGreaterThan(Double currentCyclePool);
}