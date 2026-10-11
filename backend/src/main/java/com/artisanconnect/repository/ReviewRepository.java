package com.artisanconnect.repository;
import com.artisanconnect.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    Optional<Review> findByCustomerIdAndProductId(Long customerId, Long productId);
    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAvgRatingByProductId(@Param("productId") Long productId);
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    int countByProductId(@Param("productId") Long productId);
}
