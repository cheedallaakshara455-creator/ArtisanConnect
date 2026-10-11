package com.artisanconnect.service;

import com.artisanconnect.model.*;
import com.artisanconnect.repository.*;
import com.artisanconnect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Transactional
    public void updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(active);
        userRepository.save(user);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalProducts", productRepository.count());
        analytics.put("totalOrders", orderRepository.count());
        
        List<Order> paidOrders = orderRepository.findByStatus(OrderStatus.PAID);
        BigDecimal revenue = paidOrders.stream()
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        analytics.put("totalRevenue", revenue);
        return analytics;
    }
    
    @Transactional
    public void verifyArtisan(Long artisanProfileId) {
        ArtisanProfile profile = artisanProfileRepository.findById(artisanProfileId)
            .orElseThrow(() -> new ResourceNotFoundException("Artisan Profile not found"));
        profile.setVerified(true);
        artisanProfileRepository.save(profile);
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    @Transactional
    public void approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setStatus(ProductStatus.ACTIVE);
        productRepository.save(product);
    }
}
