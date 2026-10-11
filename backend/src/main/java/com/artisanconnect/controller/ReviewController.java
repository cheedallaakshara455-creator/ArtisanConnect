package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.dto.ReviewRequest;
import com.artisanconnect.model.Review;
import com.artisanconnect.model.User;
import com.artisanconnect.security.UserPrincipal;
import com.artisanconnect.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    private User getCurrentUser(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> addReview(@Valid @RequestBody ReviewRequest request, Authentication auth) {
        Review review = reviewService.addReview(request, getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Review added", review));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<Review>>> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reviews retrieved", reviews));
    }
}
