package com.veraglo.erp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.veraglo.erp.service.AuthService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/auth/status")
    public Map<String, Object> status() {
        return authService.authStatus();
    }

    @PostMapping("/setup/bootstrap-admin")
    public ResponseEntity<Map<String, Object>> bootstrapAdmin(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.bootstrapAdmin(
                    body.getOrDefault("name", "Administrator"),
                    body.get("email"),
                    body.get("password")
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("ok", false, "reason", e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        return authService.login(body.getOrDefault("email", ""), body.getOrDefault("password", ""));
    }

    @GetMapping("/auth/forgot-password/settings")
    public JsonNode forgotPasswordSettings() {
        return authService.forgotPasswordSettings();
    }
}
