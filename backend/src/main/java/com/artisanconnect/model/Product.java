package com.artisanconnect.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "artisan_id", nullable = false)
    private User artisan;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int stock;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> images;

    private String material;
    private String origin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private int reviewCount = 0;

    @JsonProperty("artisanName")
    public String getArtisanName() {
        return artisan == null ? null : artisan.getUsername();
    }

    @JsonProperty("artisanId")
    public Long getArtisanId() {
        return artisan == null ? null : artisan.getId();
    }

    @JsonIgnore
    public User getArtisan() {
        return artisan;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
