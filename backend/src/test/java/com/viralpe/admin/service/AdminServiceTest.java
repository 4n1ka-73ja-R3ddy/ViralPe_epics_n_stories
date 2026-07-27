package com.viralpe.admin.service;

import com.viralpe.admin.model.AdminAuditLog;
import com.viralpe.admin.repository.AdminAuditLogRepository;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdminAuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private AdminService adminService;

    @Test
    void fundUserWithReasonShouldCreditWalletAndSaveAuditLog() {
        User user = new User();
        user.setId(10L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        User updated = adminService.fundUserWithReason(1L, 10L, 50.0, "Diwali Campaign Bonus");

        verify(walletService).creditWalletBalance(eq(10L), eq(50.0), eq("PROMOTIONAL_ADD_ON"), startsWith("ADMIN_FUND_"));
        verify(auditLogRepository).save(any(AdminAuditLog.class));
        assertNotNull(updated);
    }

    @Test
    void fundUserWithoutReasonShouldThrowException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                adminService.fundUserWithReason(1L, 10L, 50.0, "  ")
        );
        assertEquals("A valid reason or campaign note is required for fund injection.", ex.getMessage());
    }
}
