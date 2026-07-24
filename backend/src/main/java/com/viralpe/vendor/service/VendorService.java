package com.viralpe.vendor.service;

import com.viralpe.vendor.dto.VendorRequest;
import com.viralpe.vendor.dto.VendorResponse;
import com.viralpe.vendor.model.Vendor;
import com.viralpe.vendor.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    @Transactional
    public VendorResponse createVendor(VendorRequest request) {

        Vendor vendor = new Vendor();

        vendor.setVendorName(request.getVendorName());
        vendor.setBusinessName(request.getBusinessName());
        vendor.setBusinessPincode(request.getBusinessPincode());
        vendor.setOnboardedByUserId(request.getOnboardedByUserId());
        vendor.setActive(true);
        vendor.setCreatedAt(OffsetDateTime.now());

        Vendor saved = vendorRepository.save(vendor);

        return map(saved);
    }

    public VendorResponse getVendor(Long vendorId) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Vendor not found."));

        return map(vendor);
    }

    public List<VendorResponse> getAllVendors() {

        return vendorRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<VendorResponse> getVendorsByOnboardedUser(Long userId) {

        return vendorRepository.findByOnboardedByUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    private VendorResponse map(Vendor vendor) {

        VendorResponse response = new VendorResponse();

        response.setId(vendor.getId());
        response.setVendorName(vendor.getVendorName());
        response.setBusinessName(vendor.getBusinessName());
        response.setBusinessPincode(vendor.getBusinessPincode());
        response.setOnboardedByUserId(vendor.getOnboardedByUserId());
        response.setActive(vendor.getActive());
        response.setCreatedAt(vendor.getCreatedAt());

        return response;
    }
}