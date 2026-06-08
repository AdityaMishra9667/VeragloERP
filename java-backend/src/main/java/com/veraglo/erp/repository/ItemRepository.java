package com.veraglo.erp.repository;

import com.veraglo.erp.domain.ItemEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
    Optional<ItemEntity> findBySku(String sku);
    Optional<ItemEntity> findByLegacyId(String legacyId);
    boolean existsBySku(String sku);

    @Query("""
        SELECT i FROM ItemEntity i
        WHERE (:q IS NULL OR :q = '' OR
               LOWER(i.sku) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.hsn, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:status IS NULL OR :status = '' OR i.status = :status)
        """)
    Page<ItemEntity> search(@Param("q") String q, @Param("status") String status, Pageable pageable);
}
