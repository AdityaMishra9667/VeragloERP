package com.veraglo.erp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.veraglo.erp.service.ErpStateService;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ErpStateController {

    private final ErpStateService erpStateService;

    public ErpStateController(ErpStateService erpStateService) {
        this.erpStateService = erpStateService;
    }

    @GetMapping("/state")
    public ResponseEntity<?> getState() {
        return erpStateService.getState()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "no_state",
                        "message", "Database empty — client will seed on first sync"
                )));
    }

    @PutMapping("/state")
    public Map<String, Object> putState(@RequestBody JsonNode body) {
        Instant updatedAt = erpStateService.saveState(body);
        return Map.of("ok", true, "updatedAt", updatedAt.toString());
    }
}
