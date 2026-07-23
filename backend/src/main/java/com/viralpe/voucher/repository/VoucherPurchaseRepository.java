package com.viralpe.voucher.repository;

import com.viralpe.voucher.model.VoucherPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// developed by anika teja reddy
public interface VoucherPurchaseRepository
        extends JpaRepository<VoucherPurchase, Long> {

    List<VoucherPurchase> findByUserIdOrderByCreatedAtDesc(Long userId);
}




