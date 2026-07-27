package com.viralpe.admin.service;

import com.viralpe.admin.model.AdminAuditLog;
import com.viralpe.admin.repository.AdminAuditLogRepository;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AdminService {

    private final AdminAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public AdminService(
            AdminAuditLogRepository auditLogRepository,
            UserRepository userRepository,
            WalletService walletService
    ) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
    }

    public void logAction(Long adminUserId, String action, String details) {
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminUserId(adminUserId == null ? 0L : adminUserId);
        log.setAction(action);
        log.setDetails(details);
        log.setCreatedAt(OffsetDateTime.now());
        auditLogRepository.save(log);
    }

    public void logActionWithReason(
            Long adminUserId,
            Long targetUserId,
            String action,
            Double amount,
            String reason,
            String details
    ) {
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminUserId(adminUserId == null ? 0L : adminUserId);
        log.setTargetUserId(targetUserId);
        log.setAction(action);
        log.setAmount(amount);
        log.setReason(reason);
        log.setDetails(details);
        log.setCreatedAt(OffsetDateTime.now());
        auditLogRepository.save(log);
    }

    @Transactional
    public User fundUserWithReason(Long adminUserId, Long targetUserId, Double amount, String reason) {
        if (targetUserId == null) {
            throw new IllegalArgumentException("Target user ID is required.");
        }
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Funding amount must be greater than zero.");
        }
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("A valid reason or campaign note is required for fund injection.");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found with ID: " + targetUserId));

        // Credit Wallet Balance immediately
        walletService.creditWalletBalance(
                targetUserId,
                amount,
                "PROMOTIONAL_ADD_ON",
                "ADMIN_FUND_" + System.currentTimeMillis()
        );

        // Audit Trail log entry (Story 10.1)
        logActionWithReason(
                adminUserId,
                targetUserId,
                "PROMOTIONAL_FUND_INJECTION",
                amount,
                reason.trim(),
                "Credited ₹" + amount + " promotional add-on funds to user ID " + targetUserId + ". Reason: " + reason.trim()
        );

        return userRepository.findById(targetUserId).orElse(user);
    }

    public List<AdminAuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();
    }
}
