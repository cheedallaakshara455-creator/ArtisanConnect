package com.artisanconnect.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank private String name;
    private String description;
    @NotNull private Long categoryId;
    @NotNull @Positive private BigDecimal price;
    @NotNull @PositiveOrZero private int stock;
    private List<String> images;
    private String material;
    private String origin;
}
