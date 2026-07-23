package com.viralpe.auth.service;

import com.viralpe.auth.dto.AuthRequest;
import com.viralpe.auth.dto.AuthResponse;
import com.viralpe.auth.dto.DemoSignInRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${viralpe.auth.google.client-id:}")
    private String googleClientId;

    public AuthService(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().build();
    }

    public AuthResponse signInWithGoogle(String idToken) {
        if (!StringUtils.hasText(idToken)) {
            throw new IllegalArgumentException("Google sign-in failed: ID token is missing.");
        }

        GoogleIdentity identity = verifyGoogleToken(idToken);
        AuthRequest request = new AuthRequest();
        request.setProviderId(identity.providerId());
        request.setEmail(identity.email());
        request.setFullName(identity.fullName());

        return signInOrRegister(request, "GOOGLE");
    }

    public AuthResponse signInDemo(DemoSignInRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserType())) {
            throw new IllegalArgumentException("Demo sign-in failed. userType is required.");
        }

        String userType = request.getUserType().trim().toUpperCase(Locale.ROOT);
        String requestedProvider = StringUtils.hasText(request.getProvider())
                ? request.getProvider().trim().toUpperCase(Locale.ROOT)
                : "DEMO";
        final String provider = ("GOOGLE".equals(requestedProvider) || "APPLE".equals(requestedProvider) || "DEMO".equals(requestedProvider))
            ? requestedProvider
            : "DEMO";

        if ("NEW".equals(userType)) {
            AuthRequest authRequest = new AuthRequest();
            String demoId = "demo-new-" + UUID.randomUUID();
            authRequest.setProviderId(demoId);
            authRequest.setFullName(StringUtils.hasText(request.getFullName()) ? request.getFullName() : "New Demo User");
            authRequest.setEmail(StringUtils.hasText(request.getEmail())
                    ? request.getEmail()
                    : "new.user+" + System.currentTimeMillis() + "@viralpe.demo");
                return signInOrRegister(authRequest, provider);
        }

        if ("RETURNING".equals(userType)) {
            String email = StringUtils.hasText(request.getEmail())
                    ? request.getEmail()
                    : ("APPLE".equals(provider) ? "old.apple.user@viralpe.demo" : "old.google.user@viralpe.demo");

            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseGet(() -> {
                        User createdUser = new User();
                    createdUser.setAuthProvider(provider);
                    createdUser.setAuthProviderId("demo-returning-" + provider.toLowerCase(Locale.ROOT));
                        createdUser.setEmail(email);
                        createdUser.setFullName(StringUtils.hasText(request.getFullName()) ? request.getFullName() : "Returning Demo User");
                        createdUser.setRegisteredPincode("560001");
                        createdUser.setProfileComplete(true);
                        return userRepository.save(createdUser);
                    });

            if (!Boolean.TRUE.equals(user.getProfileComplete())) {
                user.setProfileComplete(true);
                if (!StringUtils.hasText(user.getRegisteredPincode())) {
                    user.setRegisteredPincode("560001");
                }
                user.setAuthProvider(provider);
                user = userRepository.save(user);
            }

            return new AuthResponse(user.getId(), generateToken(user), true, "Returning user sign-in successful.");
        }
// developed by anika teja reddy

        throw new IllegalArgumentException("Demo sign-in failed. userType must be NEW or RETURNING.");
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

        boolean requiresUpdate = !provider.equalsIgnoreCase(user.getAuthProvider())
                || !request.getProviderId().equals(user.getAuthProviderId())
                || !request.getEmail().equalsIgnoreCase(user.getEmail())
                || (StringUtils.hasText(request.getFullName()) && !request.getFullName().equals(user.getFullName()));

        if (requiresUpdate) {
            user.setAuthProvider(provider);
            user.setAuthProviderId(request.getProviderId());
            user.setEmail(request.getEmail());
            if (StringUtils.hasText(request.getFullName())) {
                user.setFullName(request.getFullName());
            }
            user = userRepository.save(user);
        }

        return new AuthResponse(user.getId(), generateToken(user), user.getProfileComplete(), "Sign-in successful.");
    }

    private GoogleIdentity verifyGoogleToken(String idToken) {
        String encodedToken = URLEncoder.encode(idToken, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GOOGLE_TOKEN_INFO_URL + encodedToken))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalArgumentException("Google sign-in failed. Unable to validate token right now.");
        }

        if (response.statusCode() != 200) {
            throw new IllegalArgumentException("Google sign-in failed. Please try again.");
        }

        JsonNode tokenInfo;
        try {
            tokenInfo = objectMapper.readTree(response.body());
        } catch (IOException ex) {
            throw new IllegalArgumentException("Google sign-in failed. Invalid token response.");
        }

        String providerId = readText(tokenInfo, "sub");
        String email = readText(tokenInfo, "email");
        String fullName = readText(tokenInfo, "name");
        String audience = readText(tokenInfo, "aud");
        String emailVerified = readText(tokenInfo, "email_verified");

        if (!StringUtils.hasText(providerId) || !StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Google sign-in failed. Required profile details are missing.");
        }

        if (StringUtils.hasText(googleClientId) && !googleClientId.equals(audience)) {
            throw new IllegalArgumentException("Google sign-in failed. Client configuration mismatch.");
        }

        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new IllegalArgumentException("Google sign-in failed. Google email is not verified.");
        }

        if (!StringUtils.hasText(fullName)) {
            fullName = email;
        }

        return new GoogleIdentity(providerId, email, fullName);
    }

    private String readText(JsonNode tokenInfo, String field) {
        JsonNode value = tokenInfo.get(field);
        return value == null ? null : value.asText();
    }

    private String generateToken(User user) {
        return UUID.randomUUID().toString();
    }

    private record GoogleIdentity(String providerId, String email, String fullName) {
    }
}
