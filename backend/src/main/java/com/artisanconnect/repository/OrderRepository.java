package com.artisanconnect.repository;
import com.artisanconnect.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.artisan.id = :artisanId ORDER BY o.createdAt DESC")
    List<Order> findOrdersByArtisanId(@Param("artisanId") Long artisanId);
    List<Order> findByStatus(com.artisanconnect.model.OrderStatus status);
}
