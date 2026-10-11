package com.artisanconnect.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "carts")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Cart {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // Existing TiDB carts rows still require this legacy column. Keep it populated
    // until the database schema can be migrated without breaking older deployments.
    @JsonIgnore
    @Column(name = "user_id", nullable = false)
    private Long legacyUserId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private int quantity;
}
