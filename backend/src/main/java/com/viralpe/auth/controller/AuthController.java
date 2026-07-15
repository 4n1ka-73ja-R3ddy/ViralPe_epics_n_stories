package com.viralpe.auth.controller;

import com.viralpe.auth.dto.AuthRequest;
import com.viralpe.auth.dto.AuthResponse;
import com.viralpe.auth.dto.DemoSignInRequest;
import com.viralpe.auth.dto.GoogleSignInRequest;
import com.viralpe.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/sign-in/google")
    public ResponseEntity<AuthResponse> signInWithGoogle(@Valid @RequestBody GoogleSignInRequest request) {
        return ResponseEntity.ok(authService.signInWithGoogle(request.getIdToken()));
    }

    @PostMapping("/sign-in/apple")
    public ResponseEntity<AuthResponse> signInWithApple(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.signInOrRegister(request, "APPLE"));
    }

    @PostMapping("/sign-in/demo")
    public ResponseEntity<AuthResponse> signInDemo(@Valid @RequestBody DemoSignInRequest request) {
        return ResponseEntity.ok(authService.signInDemo(request));
    }
}
