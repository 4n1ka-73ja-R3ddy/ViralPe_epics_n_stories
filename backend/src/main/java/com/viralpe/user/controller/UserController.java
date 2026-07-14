package com.viralpe.user.controller;

import com.viralpe.user.dto.ProfileCompletionRequest;
import com.viralpe.user.dto.UserProfileResponse;
import com.viralpe.user.model.User;
import com.viralpe.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<String> completeProfile(@Valid @RequestBody ProfileCompletionRequest request) {
        userService.completeProfile(request);
        return ResponseEntity.ok("Profile completed successfully.");
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long userId) {
        User user = userService.getUserProfile(userId);
        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfileComplete(),
                user.getRegisteredPincode(),
                user.getReferredByUserId(),
                user.getOnboardedByUserId());
        return ResponseEntity.ok(response);
    }
}
