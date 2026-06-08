package com.veraglo.erp.repository;

import com.veraglo.erp.domain.SalesOrderEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SalesOrderRepository extends JpaRepository<SalesOrderEntity, Long> {
    Optional<SalesOrderEntity> findByOrderId(String orderId);
    boolean existsByOrderId(String orderId);

    @Query("""
        SELECT s FROM SalesOrderEntity s
        WHERE (:q IS NULL OR :q = '' OR
               LOWER(s.orderId) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(s.orderNo, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(s.legacyCustomerId, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:status IS NULL OR :status = '' OR s.status = :status)
          AND (:stage IS NULL OR :stage = '' OR s.stage = :stage)
        """)
    Page<SalesOrderEntity> search(
            @Param("q") String q,
            @Param("status") String status,
            @Param("stage") String stage,
            Pageable pageable
    );
}
