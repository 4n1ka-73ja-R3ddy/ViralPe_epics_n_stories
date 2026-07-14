package com.viralpe.auth.service;

import com.viralpe.auth.dto.AuthRequest;
import com.viralpe.auth.dto.AuthResponse;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse signInOrRegister(AuthRequest request, String provider) {
        if (request == null || !StringUtils.hasText(request.getProviderId()) || !StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("Provider ID and email are required for sign-in.");
        }

        Optional<User> existingUser = userRepository.findByAuthProviderAndAuthProviderId(provider, request.getProviderId());
        if (existingUser.isEmpty()) {
            existingUser = userRepository.findByEmailIgnoreCase(request.getEmail());
        }

        User user = existingUser.orElseGet(() -> {
            User createdUser = new User();
            createdUser.setAuthProvider(provider);
            createdUser.setAuthProviderId(request.getProviderId());
            createdUser.setFullName(request.getFullName());
            createdUser.setEmail(request.getEmail());
            createdUser.setProfileComplete(false);
            return userRepository.save(createdUser);
        });

        return new AuthResponse(user.getId(), generateToken(user), user.getProfileComplete(), "Sign-in successful.");
    }

    private String generateToken(User user) {
        return UUID.randomUUID().toString();
    }
}
