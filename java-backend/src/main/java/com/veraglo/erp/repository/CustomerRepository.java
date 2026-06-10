package com.veraglo.erp.repository;

import com.veraglo.erp.domain.CustomerEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {
    Optional<CustomerEntity> findByCustomerId(String customerId);
    Optional<CustomerEntity> findByCode(String code);
    boolean existsByCustomerId(String customerId);

    @Query("""
        SELECT c FROM CustomerEntity c
        WHERE (:q IS NULL OR :q = '' OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(c.customerId) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(c.code, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(c.gstin, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:status IS NULL OR :status = '' OR c.status = :status)
        """)
    Page<CustomerEntity> search(@Param("q") String q, @Param("status") String status, Pageable pageable);
}
