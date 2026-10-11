package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.dto.ProductDTO;
import com.artisanconnect.dto.ProductRequest;
import com.artisanconnect.model.User;
import com.artisanconnect.security.UserPrincipal;
import com.artisanconnect.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private User getCurrentArtisan(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser();
    }


    @GetMapping
    public ResponseEntity<ApiResponse<Page<com.artisanconnect.model.Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String origin) {
        Page<com.artisanconnect.model.Product> products = productService.getAllProducts(PageRequest.of(page, size), search, categoryId, minPrice, maxPrice, material, origin);
        return ResponseEntity.ok(new ApiResponse<>(true, "Products retrieved", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<com.artisanconnect.model.Product>> getProductById(@PathVariable Long id) {
        com.artisanconnect.model.Product product = productService.getProductById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Product retrieved", product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<com.artisanconnect.model.Product>> createProduct(
            @Valid @RequestBody ProductRequest request, Authentication auth) {
        com.artisanconnect.model.Product product = productService.createProduct(request, getCurrentArtisan(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Product created and pending approval", product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<com.artisanconnect.model.Product>> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request, Authentication auth) {
        com.artisanconnect.model.Product product = productService.updateProduct(id, request, getCurrentArtisan(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Product updated", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id, Authentication auth) {
        productService.deleteProduct(id, getCurrentArtisan(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Product deleted", null));
    }

    @GetMapping("/artisan/{artisanId}")
    public ResponseEntity<ApiResponse<List<com.artisanconnect.model.Product>>> getArtisanProducts(@PathVariable Long artisanId) {
        List<com.artisanconnect.model.Product> products = productService.getProductsByArtisan(artisanId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Artisan products retrieved", products));
    }
}
