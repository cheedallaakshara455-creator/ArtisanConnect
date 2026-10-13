package com.artisanconnect.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String shippingAddress;
    private String phone;
    private String paymentMethod;
    private String razorpayOrderId;
    private String razorpayPaymentId;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
