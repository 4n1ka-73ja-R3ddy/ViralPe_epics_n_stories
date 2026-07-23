package com.viralpe.admin.repository;

import com.viralpe.admin.model.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
// developed by anika teja reddy

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
}

