package com.artisanconnect.dto;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CartRequest {
    @NotNull private Long productId;
    @NotNull @Positive private int quantity;
}
