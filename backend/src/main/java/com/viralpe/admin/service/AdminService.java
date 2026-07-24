package com.viralpe.admin.service;

import com.viralpe.admin.model.AdminAuditLog;
import com.viralpe.admin.repository.AdminAuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class AdminService {

    private final AdminAuditLogRepository auditLogRepository;

    public AdminService(AdminAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(Long adminUserId, String action, String details) {
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminUserId(adminUserId);
        log.setAction(action);
        log.setDetails(details);
        log.setCreatedAt(OffsetDateTime.now());
        auditLogRepository.save(log);
    }
}

