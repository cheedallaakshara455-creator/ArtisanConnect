package com.artisanconnect.repository;
import com.artisanconnect.model.Product;
import com.artisanconnect.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.artisan.id = :artisanId")
    List<Product> findByArtisanId(@Param("artisanId") Long artisanId);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByStatus(ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.category.name) LIKE LOWER(CONCAT('%',:search,'%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:material IS NULL OR LOWER(p.material) LIKE LOWER(CONCAT('%',:material,'%'))) AND " +
           "(:origin IS NULL OR LOWER(p.origin) LIKE LOWER(CONCAT('%',:origin,'%')))")
    Page<Product> findWithFilters(
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("material") String material,
        @Param("origin") String origin,
        Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%',:search,'%'))")
    Page<Product> searchByNameOrDescription(@Param("search") String search, Pageable pageable);
}
