package com.viralpe.wallet.repository;

import com.viralpe.wallet.model.WalletBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// developed by anika teja reddy
import java.util.Optional;

@Repository
public interface WalletBalanceRepository extends JpaRepository<WalletBalance, Long> {
    Optional<WalletBalance> findByUserId(Long userId);
}
