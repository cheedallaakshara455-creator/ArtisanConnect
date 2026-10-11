package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.dto.CartRequest;
import com.artisanconnect.model.Cart;
import com.artisanconnect.model.User;
import com.artisanconnect.security.UserPrincipal;
import com.artisanconnect.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    private User getCurrentUser(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Cart>>> getCart(Authentication auth) {
        List<Cart> cart = cartService.getCart(getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Cart retrieved", cart));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Cart>> addToCart(@Valid @RequestBody CartRequest request, Authentication auth) {
        Cart cartItem = cartService.addToCart(request, getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Item added to cart", cartItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> removeFromCart(@PathVariable Long id, Authentication auth) {
        cartService.removeFromCart(id, getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Item removed from cart", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> clearCart(Authentication auth) {
        cartService.clearCart(getCurrentUser(auth));
        return ResponseEntity.ok(new ApiResponse<>(true, "Cart cleared", null));
    }
}
