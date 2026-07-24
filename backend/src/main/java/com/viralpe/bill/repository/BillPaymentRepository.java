package com.viralpe.bill.repository;

import com.viralpe.bill.model.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {

    List<BillPayment> findByUserIdOrderByCreatedAtDesc(Long userId);
}

