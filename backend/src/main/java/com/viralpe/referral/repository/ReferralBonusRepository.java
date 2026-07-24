package com.viralpe.referral.repository;

import com.viralpe.referral.model.ReferralBonus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface ReferralBonusRepository
        extends JpaRepository<ReferralBonus, Long> {

    List<ReferralBonus> findByReferrerUserIdOrderByCreatedAtDesc(
            Long referrerUserId
    );

    List<ReferralBonus> findByReferrerUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long referrerUserId,
            OffsetDateTime startDate,
            OffsetDateTime endDate
    );
}