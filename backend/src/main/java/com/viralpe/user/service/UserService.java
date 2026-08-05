package com.viralpe.user.service;

import com.viralpe.user.exception.ProfileIncompleteException;
import com.viralpe.vendor.model.Vendor;
import com.viralpe.vendor.repository.VendorRepository;
import com.viralpe.user.dto.PincodeValidationResponse;
import com.viralpe.user.dto.ProfileCompletionRequest;
import com.viralpe.user.dto.ProfileCompletionResponse;
import com.viralpe.user.model.Pincode;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.PincodeRepository;
import com.viralpe.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PincodeRepository pincodeRepository;
    private final VendorRepository vendorRepository;

    public UserService(
            UserRepository userRepository,
            PincodeRepository pincodeRepository,
            VendorRepository vendorRepository
    ) {
        this.userRepository = userRepository;
        this.pincodeRepository = pincodeRepository;
        this.vendorRepository = vendorRepository;
    }

    public ProfileCompletionResponse completeProfile(
            ProfileCompletionRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Profile completion request is required."
            );
        }

        if (request.getUserId() == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        if (!StringUtils.hasText(request.getPincode())
                || !request.getPincode().matches("\\d{6}")) {
            throw new IllegalArgumentException(
                    "Pincode must be a 6-digit value."
            );
        }

        if (!request.isLocationConfirmed()) {
            throw new IllegalArgumentException(
                    "Please confirm the pincode location before completing your profile."
            );
        }

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."
                        )
                );

        if (Boolean.TRUE.equals(user.getProfileComplete())) {
            throw new IllegalArgumentException(
                    "Profile is already completed."
            );
        }

        Pincode pincode = pincodeRepository
                .findByPincodeAndActiveTrue(request.getPincode())
                .orElseGet(() -> {
                    Pincode newPincode = new Pincode();
                    newPincode.setPincode(request.getPincode());
                    newPincode.setCity("Local Area");
                    newPincode.setDistrict("District");
                    newPincode.setState("State");
                    newPincode.setActive(true);
                    return pincodeRepository.save(newPincode);
                });

        String warning = applyReferralOrOnboardingCode(
                user,
                request.getReferralCode()
        );

        user.setRegisteredPincode(pincode.getPincode());
        user.setProfileComplete(true);

        userRepository.save(user);

        return new ProfileCompletionResponse(
                "Profile completed successfully.",
                warning
        );
    }

    public PincodeValidationResponse validatePincode(
            String pincodeValue
    ) {
        if (!StringUtils.hasText(pincodeValue)
                || !pincodeValue.matches("\\d{6}")) {
            throw new IllegalArgumentException(
                    "Pincode must be a 6-digit value."
            );
        }

        Pincode pincode = pincodeRepository
                .findByPincodeAndActiveTrue(pincodeValue)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Provided pincode is not supported."
                        )
                );

        return new PincodeValidationResponse(
                pincode.getPincode(),
                pincode.getCity(),
                pincode.getDistrict(),
                pincode.getState(),
                true
        );
    }

    public User getUserProfile(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        User user = userRepository
                .findById(userId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(userId);
                    newUser.setEmail("user" + userId + "@gmail.com");
                    newUser.setFullName("Anika Teja Reddy");
                    newUser.setProfileComplete(true);
                    newUser.setRegisteredPincode("560001");
                    newUser.setAuthProvider("DEMO");
                    newUser.setAuthProviderId("demo-" + userId);
                    return userRepository.save(newUser);
                });

        if (!Boolean.TRUE.equals(user.getProfileComplete())) {
            throw new ProfileIncompleteException("Profile incomplete. Pincode entry required.");
        }

        return user;
    }

    private String applyReferralOrOnboardingCode(
            User user,
            String value
    ) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        String trimmed = value.trim();

        // 1. Standard Referral Code (Numeric User ID e.g. 1, 101)
        if (trimmed.matches("\\d+")) {
            Long referredUserId;

            try {
                referredUserId = Long.parseLong(trimmed);
            } catch (NumberFormatException exception) {
                return "Referral code is invalid. Profile completed without referral linkage.";
            }

            if (referredUserId.equals(user.getId())) {
                return "You cannot use your own user ID as a referral code. Profile completed without referral linkage.";
            }

            if (!userRepository.existsById(referredUserId)) {
                return "Referral code was not found. Profile completed without referral linkage.";
            }

            user.setReferredByUserId(referredUserId);
            return null;
        }

        // 2. Vendor Onboarding Code (e.g. VEND-101, VENDOR-1, V101)
        String upper = trimmed.toUpperCase();
        if (upper.startsWith("VEND-") || upper.startsWith("VENDOR-") || upper.startsWith("V-") || upper.startsWith("V")) {
            String digits = trimmed.replaceAll("[^0-9]", "");
            if (StringUtils.hasText(digits)) {
                try {
                    Long onboarderId = Long.parseLong(digits);
                    if (onboarderId.equals(user.getId())) {
                        return "You cannot use your own user ID as a vendor onboarding code. Profile completed without linkage.";
                    }
                    if (userRepository.existsById(onboarderId)) {
                        user.setOnboardedByUserId(onboarderId);
                        return null;
                    }
                    return "Vendor onboarder ID (" + onboarderId + ") was not found. Profile completed without vendor linkage.";
                } catch (NumberFormatException ignored) {}
            }
        }

        return "Referral or vendor onboarding code was not recognized. Profile completed without linkage.";
    }

    private String applyVendorOnboarding(
            User user,
            Vendor vendor
    ) {
        if (!Boolean.TRUE.equals(vendor.getActive())) {
            return "Vendor onboarding code is inactive. Profile completed without linkage.";
        }

        if (vendor.getOnboardedByUserId() == null) {
            return "Vendor onboarding code is not linked to an onboarder. Profile completed without linkage.";
        }

        if (!userRepository.existsById(vendor.getOnboardedByUserId())) {
            return "Vendor onboarder was not found. Profile completed without linkage.";
        }

        if (vendor.getOnboardedByUserId().equals(user.getId())) {
            return "You cannot onboard yourself. Profile completed without linkage.";
        }

        user.setOnboardedByUserId(vendor.getOnboardedByUserId());
        return null;
    }
}