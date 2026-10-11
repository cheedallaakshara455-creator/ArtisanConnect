package com.artisanconnect.dto;
import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
