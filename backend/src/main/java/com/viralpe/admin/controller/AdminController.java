package com.viralpe.admin.controller;

import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import com.viralpe.wallet.service.WalletService;
import com.viralpe.user.model.Pincode;
import com.viralpe.user.repository.PincodeRepository;
import com.viralpe.admin.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final PincodeRepository pincodeRepository;
    private final AdminService adminService;

    public AdminController(UserRepository userRepository, WalletService walletService, PincodeRepository pincodeRepository, AdminService adminService) {
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.pincodeRepository = pincodeRepository;
        this.adminService = adminService;
    }

    @PostMapping("/fund/{userId}")
    public ResponseEntity<String> fundUser(@PathVariable Long userId, @RequestParam Double amount) {
// developed by anika teja reddy
        Optional<User> u = userRepository.findById(userId);
        if (u.isEmpty()) return ResponseEntity.notFound().build();
        walletService.creditWalletBalance(userId, amount, "admin_fund", "admin_fund");
        adminService.logAction(0L, "FUND_USER", "funded userId=" + userId + " amount=" + amount);
        return ResponseEntity.ok("funded");
    }

    @PostMapping("/pincode")
    public ResponseEntity<Pincode> createPincode(@RequestBody Pincode pincode) {
        Pincode saved = pincodeRepository.save(pincode);
        adminService.logAction(0L, "CREATE_PINCODE", "pincode=" + saved.getPincode());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/pincode")
    public ResponseEntity<java.util.List<Pincode>> listPincodes() {
        return ResponseEntity.ok(pincodeRepository.findAll());
    }

    @DeleteMapping("/pincode/{pincode}")
    public ResponseEntity<String> deletePincode(@PathVariable String pincode) {
        pincodeRepository.deleteById(pincode);
        adminService.logAction(0L, "DELETE_PINCODE", "pincode=" + pincode);
        return ResponseEntity.ok("deleted");
    }
    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Admin module is available.");
    }
}

