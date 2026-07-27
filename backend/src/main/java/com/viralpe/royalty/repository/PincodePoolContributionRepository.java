package com.viralpe.royalty.repository;

import com.viralpe.royalty.model.PincodePoolContribution;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PincodePoolContributionRepository
        extends JpaRepository<PincodePoolContribution, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from PincodePoolContribution c where c.pincode = :pincode order by c.createdAt desc")
    List<PincodePoolContribution> findByPincodeOrderByCreatedAtDescForUpdate(
            @Param("pincode") String pincode);

    @Query("select c.sourceUserId, sum(c.amount) as totalContribution " +
            "from PincodePoolContribution c " +
            "where c.pincode = :pincode and c.createdAt >= :cycleStart and c.createdAt <= :cycleEnd " +
            "group by c.sourceUserId order by totalContribution desc")
    List<Object[]> findTopContributorByPincodeAndCycle(
            @Param("pincode") String pincode,
            @Param("cycleStart") OffsetDateTime cycleStart,
            @Param("cycleEnd") OffsetDateTime cycleEnd);

    List<PincodePoolContribution> findByPincodeAndSourceTransactionId(String pincode, Long sourceTransactionId);

    Optional<PincodePoolContribution> findFirstByPincodeAndSourceTransactionId(String pincode, Long sourceTransactionId);
}
