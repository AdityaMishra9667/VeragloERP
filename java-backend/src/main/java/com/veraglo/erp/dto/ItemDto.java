package com.veraglo.erp.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;

public record ItemDto(
        Long id,
        String sku,
        String legacyId,
        String name,
        String description,
        String hsn,
        BigDecimal rate,
        BigDecimal reorderLevel,
        boolean trackBatch,
        String status,
        JsonNode meta,
        Instant createdAt,
        Instant updatedAt
) {}
