package com.veraglo.erp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veraglo.erp.domain.ItemEntity;
import com.veraglo.erp.dto.ItemDto;
import com.veraglo.erp.dto.PageResponse;
import com.veraglo.erp.repository.ItemRepository;
import com.veraglo.erp.util.JsonUtils;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ObjectMapper objectMapper;

    public ItemService(ItemRepository itemRepository, ObjectMapper objectMapper) {
        this.itemRepository = itemRepository;
        this.objectMapper = objectMapper;
    }

    public PageResponse<ItemDto> list(String q, String status, int page, int size) {
        var result = itemRepository.search(q, status, PageRequest.of(page, size, Sort.by("sku").ascending()));
        return PageResponse.from(result.map(this::toDto));
    }

    public ItemDto getBySku(String sku) {
        return toDto(findBySku(sku));
    }

    @Transactional
    public ItemDto create(JsonNode body) {
        String sku = body.hasNonNull("sku") ? body.get("sku").asText().trim().toUpperCase() : null;
        if (sku == null || sku.isBlank()) {
            throw new IllegalArgumentException("SKU is required");
        }
        if (itemRepository.existsBySku(sku)) {
            throw new IllegalArgumentException("Item already exists: " + sku);
        }
        ItemEntity entity = fromJson(new ItemEntity(), body);
        entity.setSku(sku);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        return toDto(itemRepository.save(entity));
    }

    @Transactional
    public ItemDto update(String sku, JsonNode body) {
        ItemEntity entity = findBySku(sku);
        fromJson(entity, body);
        entity.setUpdatedAt(Instant.now());
        return toDto(itemRepository.save(entity));
    }

    @Transactional
    public void delete(String sku) {
        ItemEntity entity = findBySku(sku);
        entity.setStatus("Deleted");
        entity.setUpdatedAt(Instant.now());
        itemRepository.save(entity);
    }

    private ItemEntity findBySku(String sku) {
        String normalized = sku.trim().toUpperCase();
        return itemRepository.findBySku(normalized)
                .or(() -> itemRepository.findByLegacyId(sku))
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + sku));
    }

    private ItemEntity fromJson(ItemEntity entity, JsonNode body) {
        if (body.hasNonNull("legacyId") || body.hasNonNull("id")) {
            entity.setLegacyId(body.hasNonNull("legacyId") ? body.get("legacyId").asText() : body.get("id").asText());
        }
        if (body.hasNonNull("name")) entity.setName(body.get("name").asText());
        if (body.hasNonNull("description")) entity.setDescription(body.get("description").asText());
        if (body.hasNonNull("hsn") || body.hasNonNull("hsnCode")) {
            entity.setHsn(body.hasNonNull("hsn") ? body.get("hsn").asText() : body.get("hsnCode").asText());
        }
        if (body.has("rate")) entity.setRate(body.get("rate").decimalValue());
        if (body.has("reorderLevel") || body.has("reorder")) {
            entity.setReorderLevel(body.has("reorderLevel") ? body.get("reorderLevel").decimalValue() : body.get("reorder").decimalValue());
        }
        if (body.has("trackBatch") || body.has("batchTracked")) {
            entity.setTrackBatch(body.has("trackBatch") ? body.get("trackBatch").asBoolean() : body.get("batchTracked").asBoolean());
        }
        if (body.hasNonNull("status")) entity.setStatus(body.get("status").asText());
        if (body.has("meta")) {
            entity.setMeta(JsonUtils.write(objectMapper, body.get("meta"), "{}"));
        } else {
            entity.setMeta(JsonUtils.write(objectMapper, body, "{}"));
        }
        if (entity.getName() == null || entity.getName().isBlank()) {
            throw new IllegalArgumentException("Item name is required");
        }
        return entity;
    }

    private ItemDto toDto(ItemEntity entity) {
        return new ItemDto(
                entity.getId(),
                entity.getSku(),
                entity.getLegacyId(),
                entity.getName(),
                entity.getDescription(),
                entity.getHsn(),
                entity.getRate() != null ? entity.getRate() : BigDecimal.ZERO,
                entity.getReorderLevel() != null ? entity.getReorderLevel() : BigDecimal.ZERO,
                entity.isTrackBatch(),
                entity.getStatus(),
                JsonUtils.parseOrEmpty(objectMapper, entity.getMeta()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
