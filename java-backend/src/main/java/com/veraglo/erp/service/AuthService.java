package com.veraglo.erp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veraglo.erp.domain.UserEntity;
import com.veraglo.erp.repository.UserRepository;
import com.veraglo.erp.security.JwtService;
import com.veraglo.erp.security.PasswordHasher;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final JwtService jwtService;
    private final ErpStateService erpStateService;
    private final ObjectMapper objectMapper;

    public AuthService(
            UserRepository userRepository,
            PasswordHasher passwordHasher,
            JwtService jwtService,
            ErpStateService erpStateService,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.jwtService = jwtService;
        this.erpStateService = erpStateService;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> authStatus() {
        long userCount = userRepository.countByDeletedFalse();
        boolean hasState = erpStateService.hasState();
        Map<String, Object> result = new HashMap<>();
        result.put("hasUsers", userCount > 0);
        result.put("hasState", hasState);
        result.put("needsSetup", userCount == 0);
        result.put("backend", "java-spring-boot");
        result.put("hint", userCount == 0
                ? "Create the first administrator via setup screen or POST /api/setup/bootstrap-admin"
                : "Sign in with your administrator email and password");
        return result;
    }

    @Transactional
    public Map<String, Object> bootstrapAdmin(String name, String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required");
        }
        if (userRepository.countByDeletedFalse() > 0) {
            throw new IllegalStateException("Users already exist");
        }
        UserEntity user = createUser(name, email, password, "admin");
        String token = jwtService.generateToken(user.getEmail(), user.getRoleKey(), user.getId());
        return Map.of(
                "ok", true,
                "email", user.getEmail(),
                "token", token,
                "roleKey", user.getRoleKey()
        );
    }

    public Map<String, Object> login(String email, String password) {
        Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return Map.of("ok", false, "reason", "Invalid email or password");
        }
        UserEntity user = userOpt.get();
        if (user.isDeleted() || !"Active".equalsIgnoreCase(user.getStatus()) || !user.isLoginAllowed()) {
            return Map.of("ok", false, "reason", "Account is inactive or locked");
        }
        if (!passwordHasher.matches(user.getPasswordSalt(), password, user.getPasswordHash())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            userRepository.save(user);
            return Map.of("ok", false, "reason", "Invalid email or password");
        }
        user.setFailedAttempts(0);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getRoleKey(), user.getId());
        return Map.of(
                "ok", true,
                "token", token,
                "email", user.getEmail(),
                "roleKey", user.getRoleKey(),
                "name", user.getName()
        );
    }

    @Transactional
    public UserEntity createUser(String name, String email, String password, String roleKey) {
        String salt = passwordHasher.newSalt();
        UserEntity user = new UserEntity();
        user.setUserId("USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        user.setName(name);
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordSalt(salt);
        user.setPasswordHash(passwordHasher.hash(salt, password));
        user.setRoleKey(roleKey);
        user.setStatus("Active");
        user.setLoginAllowed(true);
        return userRepository.save(user);
    }

    public JsonNode forgotPasswordSettings() {
        return erpStateService.readSettingsNode("security.forgotPassword", objectMapper.createObjectNode());
    }
}
