package com.viralpe.user.service;

import com.viralpe.user.dto.ProfileCompletionRequest;
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

    public UserService(UserRepository userRepository, PincodeRepository pincodeRepository) {
        this.userRepository = userRepository;
        this.pincodeRepository = pincodeRepository;
    }

    public void completeProfile(ProfileCompletionRequest request) {
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
        user.setReferredByUserId(parseLongValue(request.getReferralCode()));
        userRepository.save(user);
    }

    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    private Long parseLongValue(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Referral code must be numeric.");
        }
    }
}
