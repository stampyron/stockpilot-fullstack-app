package com.stockpilot.repository;

import com.stockpilot.entity.Product;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId)")
    List<Product> searchAndFilterProducts(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            Sort sort
    );

    long countByQuantityBetween(int min, int max);
    long countByQuantity(int quantity);
}
