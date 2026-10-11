package com.artisanconnect.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductDTO {
    private Long id;
    private Long artisanId;
    private String artisanName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private int stock;
    private List<String> images;
    private String material;
    private String origin;
    private String status;
    private LocalDateTime createdAt;
    private Double rating;
    private int reviewCount;
}
