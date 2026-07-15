package com.viralpe.user.service;

import com.viralpe.user.dto.ProfileCompletionRequest;
import com.viralpe.user.dto.ProfileCompletionResponse;
import com.viralpe.user.dto.PincodeValidationResponse;
import com.viralpe.user.model.Pincode;
import com.viralpe.user.model.User;
import com.viralpe.transaction.model.Vendor;
import com.viralpe.transaction.repository.VendorRepository;
import com.viralpe.user.repository.PincodeRepository;
import com.viralpe.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PincodeRepository pincodeRepository;
    private final VendorRepository vendorRepository;

    public UserService(UserRepository userRepository, PincodeRepository pincodeRepository, VendorRepository vendorRepository) {
        this.userRepository = userRepository;
        this.pincodeRepository = pincodeRepository;
        this.vendorRepository = vendorRepository;
    }

    public ProfileCompletionResponse completeProfile(ProfileCompletionRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required.");
        }

        if (!StringUtils.hasText(request.getPincode()) || request.getPincode().length() != 6) {
            throw new IllegalArgumentException("Pincode must be a 6-digit value.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (Boolean.TRUE.equals(user.getProfileComplete())) {
            throw new IllegalArgumentException("Profile is already completed.");
        }

        Pincode pincode = pincodeRepository.findByPincodeAndActiveTrue(request.getPincode())
                .orElseThrow(() -> new IllegalArgumentException("Provided pincode is not supported."));

        user.setRegisteredPincode(pincode.getPincode());
        user.setProfileComplete(true);
        String warning = applyReferralOrOnboardingCode(user, request.getReferralCode());
        userRepository.save(user);

        return new ProfileCompletionResponse("Profile completed successfully.", warning);
    }

    public PincodeValidationResponse validatePincode(String pincodeValue) {
        if (!StringUtils.hasText(pincodeValue) || pincodeValue.length() != 6) {
            throw new IllegalArgumentException("Pincode must be a 6-digit value.");
        }

        Pincode pincode = pincodeRepository.findByPincodeAndActiveTrue(pincodeValue)
                .orElseThrow(() -> new IllegalArgumentException("Provided pincode is not supported."));

        return new PincodeValidationResponse(
                pincode.getPincode(),
                pincode.getCity(),
                pincode.getDistrict(),
                pincode.getState(),
                true
        );
    }

    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    private String applyReferralOrOnboardingCode(User user, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        String trimmed = value.trim();

        if (trimmed.matches("\\d+")) {
            Long referredUserId = Long.parseLong(trimmed);
            if (!userRepository.existsById(referredUserId)) {
                return "Referral code was not found. Profile completed without referral linkage.";
            }
            user.setReferredByUserId(referredUserId);
            return null;
        }

        return vendorRepository.findByVendorCode(trimmed)
                .map(vendor -> applyVendorOnboarding(user, vendor))
                .orElse("Referral/onboarding code is invalid. Profile completed without linkage.");
    }

    private String applyVendorOnboarding(User user, Vendor vendor) {
        user.setOnboardedByUserId(vendor.getId());
        return null;
    }
}
