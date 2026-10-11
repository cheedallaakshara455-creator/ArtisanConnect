package com.artisanconnect.controller;

import com.artisanconnect.dto.ApiResponse;
import com.artisanconnect.dto.PaymentRequest;
import com.artisanconnect.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order/{orderId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> createRazorpayOrder(@PathVariable Long orderId) {
        Map<String, String> result = paymentService.createRazorpayOrder(orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment order created", result));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyPayment(@Valid @RequestBody PaymentRequest request) {
        paymentService.verifyPayment(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment verified successfully", null));
    }
}
