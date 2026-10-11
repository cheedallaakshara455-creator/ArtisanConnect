package com.artisanconnect.service;

import com.artisanconnect.dto.CartRequest;
import com.artisanconnect.exception.ResourceNotFoundException;
import com.artisanconnect.model.Cart;
import com.artisanconnect.model.Product;
import com.artisanconnect.model.User;
import com.artisanconnect.repository.CartRepository;
import com.artisanconnect.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public List<Cart> getCart(User customer) {
        return cartRepository.findByCustomerId(customer.getId());
    }

    @Transactional
    public Cart addToCart(CartRequest request, User customer) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough stock available");
        }

        Cart cart = cartRepository.findByCustomerIdAndProductId(customer.getId(), product.getId())
                .orElse(Cart.builder()
                        .customer(customer)
                        .legacyUserId(customer.getId())
                        .product(product)
                        .quantity(0)
                        .build());

        cart.setQuantity(cart.getQuantity() + request.getQuantity());
        return cartRepository.save(cart);
    }

    @Transactional
    public void removeFromCart(Long cartId, User customer) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cart.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        cartRepository.delete(cart);
    }

    @Transactional
    public void clearCart(User customer) {
        cartRepository.deleteByCustomerId(customer.getId());
    }

    public BigDecimal getCartTotal(User customer) {
        return getCart(customer).stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
