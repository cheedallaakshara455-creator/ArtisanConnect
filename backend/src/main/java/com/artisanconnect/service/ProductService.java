package com.artisanconnect.service;

import com.artisanconnect.dto.ProductRequest;
import com.artisanconnect.exception.ResourceNotFoundException;
import com.artisanconnect.model.Category;
import com.artisanconnect.model.Product;
import com.artisanconnect.model.ProductStatus;
import com.artisanconnect.model.User;
import com.artisanconnect.repository.CategoryRepository;
import com.artisanconnect.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<Product> getAllProducts(Pageable pageable, String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String material, String origin) {
        return productRepository.findWithFilters(search, categoryId, minPrice, maxPrice, material, origin, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public List<Product> getProductsByArtisan(Long artisanId) {
        return productRepository.findByArtisanId(artisanId);
    }

    @Transactional
    public Product createProduct(ProductRequest request, User artisan) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .price(request.getPrice())
                .stock(request.getStock())
                .material(request.getMaterial())
                .origin(request.getOrigin())
                .artisan(artisan)
                .status(ProductStatus.PENDING)
                .build();
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request, User artisan) {
        Product product = getProductById(id);
        if (!product.getArtisan().getId().equals(artisan.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setMaterial(request.getMaterial());
        product.setOrigin(request.getOrigin());
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id, User artisan) {
        Product product = getProductById(id);
        if (!product.getArtisan().getId().equals(artisan.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        productRepository.delete(product);
    }

    @Transactional
    public void updateRating(Long productId, double newRating, int numReviews) {
        Product product = getProductById(productId);
        product.setRating(newRating);
        product.setReviewCount(numReviews);
        productRepository.save(product);
    }
}
