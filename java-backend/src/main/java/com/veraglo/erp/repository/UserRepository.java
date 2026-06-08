package com.veraglo.erp.repository;

import com.veraglo.erp.domain.UserEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    long countByDeletedFalse();
}
