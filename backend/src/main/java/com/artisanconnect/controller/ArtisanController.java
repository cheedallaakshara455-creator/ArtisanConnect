package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.exception.ResourceNotFoundException;
import com.artisanconnect.model.ArtisanProfile;
import com.artisanconnect.model.User;
import com.artisanconnect.repository.ArtisanProfileRepository;
import com.artisanconnect.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artisans")
@RequiredArgsConstructor
public class ArtisanController {
    
    private final ArtisanProfileRepository artisanProfileRepository;
    
    private User getCurrentUser(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ArtisanProfile>>> getAllArtisans() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Artisans retrieved", artisanProfileRepository.findAll()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtisanProfile>> getArtisanById(@PathVariable Long id) {
        ArtisanProfile profile = artisanProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Artisan profile not found"));
        return ResponseEntity.ok(new ApiResponse<>(true, "Artisan retrieved", profile));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<ArtisanProfile>> updateProfile(
            @RequestBody ArtisanProfile updatedProfile, Authentication auth) {
        User user = getCurrentUser(auth);
        ArtisanProfile profile = artisanProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Artisan profile not found"));
            
        profile.setCraftType(updatedProfile.getCraftType());
        profile.setBio(updatedProfile.getBio());
        profile.setLocation(updatedProfile.getLocation());
        profile.setState(updatedProfile.getState());
        profile.setYearsExperience(updatedProfile.getYearsExperience());
        profile.setBannerImage(updatedProfile.getBannerImage());
        
        ArtisanProfile saved = artisanProfileRepository.save(profile);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated", saved));
    }
}
