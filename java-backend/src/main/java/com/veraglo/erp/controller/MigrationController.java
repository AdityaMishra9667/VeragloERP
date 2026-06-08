package com.veraglo.erp.controller;

import com.veraglo.erp.config.VeragloProperties;
import com.veraglo.erp.service.LegacyJsonMigrationService;
import java.nio.file.Path;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/migration")
public class MigrationController {

    private final LegacyJsonMigrationService migrationService;
    private final VeragloProperties properties;

    public MigrationController(LegacyJsonMigrationService migrationService, VeragloProperties properties) {
        this.migrationService = migrationService;
        this.properties = properties;
    }

    @PostMapping("/import-json")
    public ResponseEntity<?> importJson(@RequestBody Map<String, Object> body) throws Exception {
        String path = body.get("path") != null
                ? body.get("path").toString()
                : properties.getMigration().getLegacyJsonPath();
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "path is required"));
        }
        boolean normalize = Boolean.TRUE.equals(body.get("normalize"));
        return ResponseEntity.ok(migrationService.importFromFile(Path.of(path), normalize));
    }

    @PostMapping("/normalize")
    public ResponseEntity<?> normalizeExisting() {
        try {
            return ResponseEntity.ok(migrationService.importFromPostgresJsonSnapshot());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("ok", false, "message", e.getMessage()));
        }
    }
}
