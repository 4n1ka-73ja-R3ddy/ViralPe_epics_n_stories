package com.viralpe.vendor.controller;

import com.viralpe.vendor.dto.VendorRequest;
import com.viralpe.vendor.dto.VendorResponse;
import com.viralpe.vendor.service.VendorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping
    public VendorResponse createVendor(@RequestBody VendorRequest request) {
        return vendorService.createVendor(request);
    }

    @GetMapping("/{vendorId}")
    public VendorResponse getVendor(@PathVariable Long vendorId) {
        return vendorService.getVendor(vendorId);
    }

    @GetMapping
    public List<VendorResponse> getAllVendors() {
        return vendorService.getAllVendors();
    }

    @GetMapping("/onboarded-by/{userId}")
    public List<VendorResponse> getVendorsByOnboardedUser(@PathVariable Long userId) {
        return vendorService.getVendorsByOnboardedUser(userId);
    }
}