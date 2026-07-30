package com.viralpe.admin.controller;

import com.viralpe.admin.dto.FundUserRequest;
import com.viralpe.admin.model.AdminAuditLog;
import com.viralpe.admin.service.AdminService;
import com.viralpe.user.model.Pincode;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.PincodeRepository;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PincodeRepository pincodeRepository;
    private final AdminService adminService;
    private final WalletService walletService;

    public AdminController(
            UserRepository userRepository,
            PincodeRepository pincodeRepository,
            AdminService adminService,
            WalletService walletService
    ) {
        this.userRepository = userRepository;
        this.pincodeRepository = pincodeRepository;
        this.adminService = adminService;
        this.walletService = walletService;
    }

    // --- Story 10.1: Platform Add-On Fund Injection ---

    @PostMapping("/fund")
    public ResponseEntity<?> fundUser(@RequestBody FundUserRequest req) {
        try {
            User updatedUser = adminService.fundUserWithReason(
                    req.getAdminUserId() == null ? 0L : req.getAdminUserId(),
                    req.getUserId(),
                    req.getAmount(),
                    req.getReason()
            );
            double newBalance = walletService.getWalletSummary(updatedUser.getId()).getWalletBalance();
            return ResponseEntity.ok(Map.of(
                    "message", "Promotional funds credited successfully.",
                    "userId", updatedUser.getId(),
                    "walletBalance", newBalance
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/fund/{userId}")
    public ResponseEntity<?> fundUserLegacy(
            @PathVariable Long userId,
            @RequestParam Double amount,
            @RequestParam(required = false, defaultValue = "Admin promotional credit") String reason,
            @RequestParam(required = false, defaultValue = "0") Long adminUserId
    ) {
        try {
            User updatedUser = adminService.fundUserWithReason(adminUserId, userId, amount, reason);
            double newBalance = walletService.getWalletSummary(updatedUser.getId()).getWalletBalance();
            return ResponseEntity.ok(Map.of(
                    "message", "Promotional funds credited successfully.",
                    "userId", updatedUser.getId(),
                    "walletBalance", newBalance
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> listUsers(@RequestParam(required = false) String search) {
        List<User> users = userRepository.findAll();
        if (StringUtils.hasText(search)) {
            String query = search.toLowerCase().trim();
            users = users.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(query))
                              || (u.getEmail() != null && u.getEmail().toLowerCase().contains(query))
                              || (u.getId() != null && u.getId().toString().contains(query)))
                    .toList();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAllAuditLogs());
    }

    // --- Story 10.2: Pincode Master Directory Management ---

    @GetMapping("/pincode")
    public ResponseEntity<List<Pincode>> listPincodes() {
        return ResponseEntity.ok(pincodeRepository.findAll());
    }

    @PostMapping("/pincode")
    public ResponseEntity<?> createPincode(@RequestBody Pincode pincode) {
        if (pincode == null || !StringUtils.hasText(pincode.getPincode())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Pincode is required."));
        }
        pincode.setPincode(pincode.getPincode().trim());
        if (pincode.getActive() == null) {
            pincode.setActive(true);
        }
        Pincode saved = pincodeRepository.save(pincode);
        adminService.logAction(0L, "CREATE_PINCODE", "Created pincode=" + saved.getPincode() + " (" + saved.getCity() + ", " + saved.getState() + ")");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/pincode/{pincodeValue}")
    public ResponseEntity<?> updatePincode(@PathVariable String pincodeValue, @RequestBody Pincode updated) {
        Optional<Pincode> existingOpt = pincodeRepository.findById(pincodeValue);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Pincode existing = existingOpt.get();
        if (updated.getCity() != null) existing.setCity(updated.getCity());
        if (updated.getDistrict() != null) existing.setDistrict(updated.getDistrict());
        if (updated.getState() != null) existing.setState(updated.getState());
        if (updated.getActive() != null) existing.setActive(updated.getActive());

        Pincode saved = pincodeRepository.save(existing);
        adminService.logAction(0L, "UPDATE_PINCODE", "Updated pincode=" + pincodeValue);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/pincode/{pincodeValue}/toggle-active")
    public ResponseEntity<?> togglePincodeActive(@PathVariable String pincodeValue) {
        Optional<Pincode> existingOpt = pincodeRepository.findById(pincodeValue);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Pincode existing = existingOpt.get();
        boolean newActive = !Boolean.TRUE.equals(existing.getActive());
        existing.setActive(newActive);
        pincodeRepository.save(existing);
        adminService.logAction(0L, "TOGGLE_PINCODE_ACTIVE", "Toggled pincode=" + pincodeValue + " to active=" + newActive);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/pincode/{pincodeValue}")
    public ResponseEntity<String> deletePincode(@PathVariable String pincodeValue) {
        pincodeRepository.deleteById(pincodeValue);
        adminService.logAction(0L, "DELETE_PINCODE", "Deleted pincode=" + pincodeValue);
        return ResponseEntity.ok("Pincode " + pincodeValue + " deleted.");
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Admin module is available.");
    }

    @PostMapping("/reset-users")
    public ResponseEntity<?> resetAllUsers() {
        userRepository.deleteAll();
        adminService.logAction(0L, "RESET_ALL_USERS", "Cleared all user emails & accounts from database for presentation sign-in steps demo.");
        return ResponseEntity.ok(Map.of(
            "message", "All user accounts and emails have been deleted successfully from database.",
            "userCount", userRepository.count()
        ));
    }
}
