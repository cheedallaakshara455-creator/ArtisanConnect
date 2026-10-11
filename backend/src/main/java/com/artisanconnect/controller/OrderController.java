package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.dto.OrderRequest;
import com.artisanconnect.model.Order;
import com.artisanconnect.model.OrderStatus;
import com.artisanconnect.model.User;
import com.artisanconnect.security.UserPrincipal;
import com.artisanconnect.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private User getCurrentUser(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(@Valid @RequestBody OrderRequest request, Authentication auth) {
        Order order = orderService.createOrder(request, getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Order created", order));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(Authentication auth) {
        List<Order> orders = orderService.getCustomerOrders(getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders retrieved", orders));
    }

    @GetMapping("/artisan")
    public ResponseEntity<ApiResponse<List<Order>>> getArtisanOrders(Authentication auth) {
        List<Order> orders = orderService.getArtisanOrders(getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Artisan orders retrieved", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order retrieved", order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        OrderStatus status = OrderStatus.valueOf(statusMap.get("status").toUpperCase());
        Order order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order status updated", order));
    }
}
