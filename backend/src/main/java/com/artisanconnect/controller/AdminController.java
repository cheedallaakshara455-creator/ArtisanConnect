package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.model.Order;
import com.artisanconnect.model.Product;
import com.artisanconnect.model.User;
import com.artisanconnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved", adminService.getAllUsers()));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable Long id, @RequestBody Map<String, Boolean> statusMap) {
        adminService.updateUserStatus(id, statusMap.get("active"));
        return ResponseEntity.ok(new ApiResponse<>(true, "User status updated", null));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders retrieved", adminService.getAllOrders()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Analytics retrieved", adminService.getAnalytics()));
    }

    @PutMapping("/artisans/{profileId}/verify")
    public ResponseEntity<ApiResponse<String>> verifyArtisan(@PathVariable Long profileId) {
        adminService.verifyArtisan(profileId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Artisan verified", null));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Products retrieved", adminService.getAllProducts()));
    }

    @PutMapping("/products/{id}/approve")
    public ResponseEntity<ApiResponse<String>> approveProduct(@PathVariable Long id) {
        adminService.approveProduct(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Product approved", null));
    }
}
