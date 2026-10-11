package com.artisanconnect.dto;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OrderRequest {
    @NotBlank private String shippingAddress;
    @NotBlank @Pattern(regexp="^[6-9]\\d{9}$", message="Valid 10-digit phone required")
    private String phone;
    @NotBlank private String paymentMethod;
}
