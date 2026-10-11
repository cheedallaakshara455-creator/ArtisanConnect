package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.dto.AuthResponse;
import com.artisanconnect.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes a protected endpoint that returns the currently‑authenticated user.
 * The JWT filter populates {@link UserPrincipal} and Spring injects it via
 * {@code @AuthenticationPrincipal}.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    /**
     * GET /api/users/me
     *
     * @param userPrincipal the logged‑in user (populated from the JWT)
     * @return a standard {@link ApiResponse} wrapping an {@link AuthResponse}
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        // Build the same response shape you use for login/registration
        AuthResponse authResponse = AuthResponse.builder()
                .token(null)                     // no new token is needed here
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getUser().getEmail())
                .role(userPrincipal.getAuthorities()
                        .stream()
                        .map(a -> a.getAuthority())
                        .findFirst()
                        .orElse("UNKNOWN"))
                .userId(userPrincipal.getUser().getId())
                .build();

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Current user", authResponse));
    }
}