package com.viralpe.recharge.repository;

import com.viralpe.recharge.model.RechargeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
// developed by anika teja reddy

@Repository
public interface RechargeTransactionRepository
        extends JpaRepository<RechargeTransaction, Long> {

    List<RechargeTransaction>
    findByUserIdOrderByCreatedAtDesc(Long userId);
}