package com.veraglo.erp.repository;

import com.veraglo.erp.domain.MigrationRunEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MigrationRunRepository extends JpaRepository<MigrationRunEntity, Long> {
}
