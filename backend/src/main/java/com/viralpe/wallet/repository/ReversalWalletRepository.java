package com.viralpe.wallet.repository;

import com.viralpe.wallet.model.ReversalWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReversalWalletRepository extends JpaRepository<ReversalWallet, Long> {

    Optional<ReversalWallet> findByUserId(Long userId);
}