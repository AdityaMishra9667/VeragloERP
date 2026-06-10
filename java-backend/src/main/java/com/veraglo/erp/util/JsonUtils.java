package com.veraglo.erp.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public final class JsonUtils {

    private JsonUtils() {}

    public static JsonNode parseOrEmpty(ObjectMapper mapper, String raw) {
        if (raw == null || raw.isBlank()) {
            return mapper.createObjectNode();
        }
        try {
            return mapper.readTree(raw);
        } catch (Exception e) {
            return mapper.createObjectNode();
        }
    }

    public static JsonNode parseArrayOrEmpty(ObjectMapper mapper, String raw) {
        if (raw == null || raw.isBlank()) {
            return mapper.createArrayNode();
        }
        try {
            JsonNode node = mapper.readTree(raw);
            return node.isArray() ? node : mapper.createArrayNode();
        } catch (Exception e) {
            return mapper.createArrayNode();
        }
    }

    public static String write(ObjectMapper mapper, JsonNode node, String fallback) {
        if (node == null || node.isNull()) {
            return fallback;
        }
        try {
            return mapper.writeValueAsString(node);
        } catch (Exception e) {
            return fallback;
        }
    }

    public static ObjectNode object(ObjectMapper mapper) {
        return mapper.createObjectNode();
    }

    public static ArrayNode array(ObjectMapper mapper) {
        return mapper.createArrayNode();
    }
}
