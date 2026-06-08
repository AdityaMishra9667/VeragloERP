package com.veraglo.erp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.veraglo.erp.domain.MigrationRunEntity;
import com.veraglo.erp.repository.MigrationRunRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Imports legacy Node.js / JSON document ERP data into PostgreSQL.
 * Phase 1 preserves the full document in erp_state; phase 2 normalizes key collections.
 */
@Service
public class LegacyJsonMigrationService {

    private final ErpStateService erpStateService;
    private final MigrationRunRepository migrationRunRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public LegacyJsonMigrationService(
            ErpStateService erpStateService,
            MigrationRunRepository migrationRunRepository,
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper
    ) {
        this.erpStateService = erpStateService;
        this.migrationRunRepository = migrationRunRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, Object> importFromFile(Path filePath, boolean normalize) throws IOException {
        MigrationRunEntity run = new MigrationRunEntity();
        run.setSourceType("legacy-json");
        run.setSourcePath(filePath.toString());
        run.setStatus("running");
        migrationRunRepository.save(run);

        try {
            String raw = Files.readString(filePath);
            JsonNode state = objectMapper.readTree(raw);
            erpStateService.saveState(state);

            Map<String, Integer> counts = new HashMap<>();
            counts.put("erp_state", 1);
            if (normalize) {
                counts.putAll(normalizeCollections(state));
            }

            ObjectNode summary = objectMapper.createObjectNode();
            counts.forEach(summary::put);
            run.setRecordsMigrated(objectMapper.writeValueAsString(summary));
            run.setStatus("completed");
            run.setCompletedAt(Instant.now());
            migrationRunRepository.save(run);

            return Map.of(
                    "ok", true,
                    "migrationId", run.getId(),
                    "recordsMigrated", counts,
                    "message", "Legacy JSON imported successfully"
            );
        } catch (Exception e) {
            run.setStatus("failed");
            run.setErrorMessage(e.getMessage());
            run.setCompletedAt(Instant.now());
            migrationRunRepository.save(run);
            throw e;
        }
    }

    @Transactional
    public Map<String, Object> importFromPostgresJsonSnapshot() {
        MigrationRunEntity run = new MigrationRunEntity();
        run.setSourceType("postgres-json-snapshot");
        run.setStatus("running");
        migrationRunRepository.save(run);

        try {
            var stateOpt = erpStateService.getState();
            if (stateOpt.isEmpty()) {
                throw new IllegalStateException("No erp_state row found to normalize");
            }
            Map<String, Integer> counts = normalizeCollections(stateOpt.get());
            ObjectNode summary = objectMapper.createObjectNode();
            counts.forEach(summary::put);
            run.setRecordsMigrated(objectMapper.writeValueAsString(summary));
            run.setStatus("completed");
            run.setCompletedAt(Instant.now());
            migrationRunRepository.save(run);
            return Map.of("ok", true, "migrationId", run.getId(), "recordsMigrated", counts);
        } catch (Exception e) {
            run.setStatus("failed");
            run.setErrorMessage(e.getMessage());
            run.setCompletedAt(Instant.now());
            migrationRunRepository.save(run);
            throw new IllegalStateException("Normalization failed: " + e.getMessage(), e);
        }
    }

    private Map<String, Integer> normalizeCollections(JsonNode state) {
        Map<String, Integer> counts = new HashMap<>();
        counts.put("customers", upsertCustomers(state.path("customers")));
        counts.put("items", upsertItems(state.path("items")));
        counts.put("suppliers", upsertSuppliers(state.path("suppliers")));
        counts.put("users", upsertUsers(state.path("erpUsers")));
        return counts;
    }

    private int upsertCustomers(JsonNode customers) {
        if (!customers.isArray()) return 0;
        int count = 0;
        for (JsonNode c : customers) {
            String customerId = textOr(c, "CUST-" + count, "customerId", "id");
            jdbcTemplate.update("""
                INSERT INTO customers (customer_id, name, gstin, pan, email, phone, credit_limit, status, billing_address, meta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)
                ON CONFLICT (customer_id) DO UPDATE SET
                  name = EXCLUDED.name,
                  gstin = EXCLUDED.gstin,
                  email = EXCLUDED.email,
                  phone = EXCLUDED.phone,
                  updated_at = NOW()
                """,
                    customerId,
                    textOr(c, customerId, "name", "customerName"),
                    textOr(c, null, "gstin"),
                    textOr(c, null, "pan"),
                    textOr(c, null, "email"),
                    textOr(c, null, "phone"),
                    c.path("creditLimit").asDouble(0),
                    textOr(c, "Active", "status"),
                    jsonOrEmpty(c.path("billingAddress")),
                    jsonOrEmpty(c)
            );
            count++;
        }
        return count;
    }

    private int upsertItems(JsonNode items) {
        if (!items.isArray()) return 0;
        int count = 0;
        for (JsonNode item : items) {
            String sku = textOr(item, "SKU-" + count, "sku", "itemCode");
            jdbcTemplate.update("""
                INSERT INTO items (sku, name, description, hsn, rate, reorder_level, track_batch, status, meta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb)
                ON CONFLICT (sku) DO UPDATE SET
                  name = EXCLUDED.name,
                  description = EXCLUDED.description,
                  rate = EXCLUDED.rate,
                  updated_at = NOW()
                """,
                    sku,
                    textOr(item, sku, "name", "itemName"),
                    textOr(item, null, "description"),
                    textOr(item, null, "hsn", "hsnCode"),
                    item.path("rate").asDouble(0),
                    item.path("reorderLevel").asDouble(0),
                    item.path("trackBatch").asBoolean(false),
                    textOr(item, "Active", "status"),
                    jsonOrEmpty(item)
            );
            count++;
        }
        return count;
    }

    private int upsertSuppliers(JsonNode suppliers) {
        if (!suppliers.isArray()) return 0;
        int count = 0;
        for (JsonNode s : suppliers) {
            String supplierId = textOr(s, "SUP-" + count, "supplierId", "id");
            jdbcTemplate.update("""
                INSERT INTO suppliers (supplier_id, name, gstin, email, phone, rating, category, address, meta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)
                ON CONFLICT (supplier_id) DO UPDATE SET
                  name = EXCLUDED.name,
                  gstin = EXCLUDED.gstin,
                  email = EXCLUDED.email,
                  updated_at = NOW()
                """,
                    supplierId,
                    textOr(s, supplierId, "name", "supplierName"),
                    textOr(s, null, "gstin"),
                    textOr(s, null, "email"),
                    textOr(s, null, "phone"),
                    s.path("rating").asInt(0),
                    textOr(s, null, "category"),
                    jsonOrEmpty(s.path("address")),
                    jsonOrEmpty(s)
            );
            count++;
        }
        return count;
    }

    private int upsertUsers(JsonNode users) {
        if (!users.isArray()) return 0;
        int count = 0;
        for (JsonNode u : users) {
            if (u.path("isDeleted").asBoolean(false)) continue;
            String email = textOr(u, null, "email");
            if (email == null || email.isBlank()) continue;
            jdbcTemplate.update("""
                INSERT INTO users (user_id, name, email, username, password_hash, password_salt, role_key, status, login_allowed, is_deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
                ON CONFLICT (email) DO UPDATE SET
                  name = EXCLUDED.name,
                  password_hash = EXCLUDED.password_hash,
                  password_salt = EXCLUDED.password_salt,
                  role_key = EXCLUDED.role_key,
                  status = EXCLUDED.status,
                  updated_at = NOW()
                """,
                    textOr(u, "USR-" + count, "userId"),
                    textOr(u, email, "name"),
                    email.toLowerCase(),
                    textOr(u, null, "username"),
                    textOr(u, "", "passwordHash"),
                    textOr(u, "", "passwordSalt"),
                    textOr(u, "employee", "roleKey"),
                    textOr(u, "Active", "status"),
                    !u.path("loginAllowed").asBoolean(true) ? false : true
            );
            count++;
        }
        return count;
    }

    private String textOr(JsonNode node, String defaultValue, String... keys) {
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value != null && !value.isNull()) {
                String s = value.asText();
                if (!s.isBlank()) return s;
            }
        }
        return defaultValue;
    }

    private String jsonOrEmpty(JsonNode node) {
        try {
            if (node == null || node.isMissingNode() || node.isNull()) {
                return "{}";
            }
            if (node.isObject() || node.isArray()) {
                return objectMapper.writeValueAsString(node);
            }
            ObjectNode wrapper = objectMapper.createObjectNode();
            wrapper.set("value", node);
            return objectMapper.writeValueAsString(wrapper);
        } catch (Exception e) {
            return "{}";
        }
    }
}
