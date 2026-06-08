package com.veraglo.erp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.veraglo.erp.domain.ErpStateEntity;
import com.veraglo.erp.repository.ErpStateRepository;
import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ErpStateService {

    private final ErpStateRepository erpStateRepository;
    private final ObjectMapper objectMapper;

    public ErpStateService(ErpStateRepository erpStateRepository, ObjectMapper objectMapper) {
        this.erpStateRepository = erpStateRepository;
        this.objectMapper = objectMapper;
    }

    public boolean hasState() {
        return erpStateRepository.findById((short) 1).isPresent();
    }

    public Optional<JsonNode> getState() {
        return erpStateRepository.findById((short) 1)
                .map(entity -> readJson(entity.getData()));
    }

    @Transactional
    public Instant saveState(JsonNode state) {
        if (state == null || !state.has("_v")) {
            throw new IllegalArgumentException("Expected ERP state object with _v");
        }
        ErpStateEntity entity = erpStateRepository.findById((short) 1).orElseGet(ErpStateEntity::new);
        entity.setId((short) 1);
        entity.setVersion(state.get("_v").asInt());
        entity.setData(writeJson(state));
        entity.setUpdatedAt(Instant.now());
        erpStateRepository.save(entity);
        return entity.getUpdatedAt();
    }

    public JsonNode readSettingsNode(String path, JsonNode fallback) {
        return getState()
                .map(state -> {
                    JsonNode settings = state.path("settings");
                    for (String part : path.split("\\.")) {
                        settings = settings.path(part);
                    }
                    return settings.isMissingNode() ? fallback : settings;
                })
                .orElse(fallback);
    }

    public ObjectNode healthPayload(String storage, boolean postgres, String database) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("ok", true);
        node.put("storage", storage);
        node.put("postgres", postgres);
        node.put("database", database);
        node.put("backend", "java-spring-boot");
        node.put("serverTime", Instant.now().toString());
        return node;
    }

    private JsonNode readJson(String raw) {
        try {
            return objectMapper.readTree(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Invalid ERP state JSON", e);
        }
    }

    private String writeJson(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to serialize ERP state", e);
        }
    }
}
