package com.artisanconnect.service;

import com.artisanconnect.dto.ReviewRequest;
import com.artisanconnect.exception.ResourceNotFoundException;
import com.artisanconnect.model.Product;
import com.artisanconnect.model.Review;
import com.artisanconnect.model.User;
import com.artisanconnect.repository.ProductRepository;
import com.artisanconnect.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional
    public Review addReview(ReviewRequest request, User customer) {
        if (reviewRepository.existsByCustomerIdAndProductId(customer.getId(), request.getProductId())) {
            throw new IllegalArgumentException("You have already reviewed this product");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = Review.builder()
                .customer(customer)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        double averageRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        productService.updateRating(product.getId(), averageRating, reviews.size());

        return savedReview;
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }
}
