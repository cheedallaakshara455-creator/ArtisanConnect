package com.artisanconnect.service;

import com.artisanconnect.dto.PaymentRequest;
import com.artisanconnect.exception.ResourceNotFoundException;
import com.artisanconnect.model.Order;
import com.artisanconnect.model.OrderStatus;
import com.artisanconnect.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key-secret}")
    private String keySecret;
    
    @Value("${razorpay.key-id}")
    private String keyId;

    @Transactional
    public Map<String, String> createRazorpayOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        try {
            JSONObject orderRequest = new JSONObject();
            // Razorpay expects amount in paise
            int amount = order.getTotalAmount().multiply(new BigDecimal("100")).intValue();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + orderId);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            order.setRazorpayOrderId(razorpayOrder.get("id"));
            orderRepository.save(order);

            Map<String, String> response = new HashMap<>();
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            response.put("keyId", keyId);
            return response;
        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);
            if (isValid) {
                order.setStatus(OrderStatus.PAID);
                order.setRazorpayPaymentId(request.getRazorpayPaymentId());
                orderRepository.save(order);
            } else {
                throw new IllegalArgumentException("Invalid payment signature");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }
}
