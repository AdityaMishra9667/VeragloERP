package com.veraglo.erp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veraglo.erp.domain.CustomerEntity;
import com.veraglo.erp.domain.SalesOrderEntity;
import com.veraglo.erp.dto.PageResponse;
import com.veraglo.erp.dto.SalesOrderDto;
import com.veraglo.erp.repository.CustomerRepository;
import com.veraglo.erp.repository.SalesOrderRepository;
import com.veraglo.erp.util.JsonUtils;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper;

    public SalesOrderService(
            SalesOrderRepository salesOrderRepository,
            CustomerRepository customerRepository,
            ObjectMapper objectMapper
    ) {
        this.salesOrderRepository = salesOrderRepository;
        this.customerRepository = customerRepository;
        this.objectMapper = objectMapper;
    }

    public PageResponse<SalesOrderDto> list(String q, String status, String stage, int page, int size) {
        var result = salesOrderRepository.search(q, status, stage, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(result.map(this::toDto));
    }

    public SalesOrderDto getByOrderId(String orderId) {
        return toDto(findByOrderId(orderId));
    }

    @Transactional
    public SalesOrderDto create(JsonNode body) {
        String orderId = text(body, "orderId", "id");
        if (orderId == null || orderId.isBlank()) {
            orderId = "so" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (salesOrderRepository.existsByOrderId(orderId)) {
            throw new IllegalArgumentException("Sales order already exists: " + orderId);
        }
        SalesOrderEntity entity = fromJson(new SalesOrderEntity(), body);
        entity.setOrderId(orderId);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        return toDto(salesOrderRepository.save(entity));
    }

    @Transactional
    public SalesOrderDto update(String orderId, JsonNode body) {
        SalesOrderEntity entity = findByOrderId(orderId);
        fromJson(entity, body);
        entity.setUpdatedAt(Instant.now());
        return toDto(salesOrderRepository.save(entity));
    }

    @Transactional
    public SalesOrderDto updateStage(String orderId, String stage) {
        SalesOrderEntity entity = findByOrderId(orderId);
        entity.setStage(stage);
        entity.setUpdatedAt(Instant.now());
        return toDto(salesOrderRepository.save(entity));
    }

    @Transactional
    public void delete(String orderId) {
        SalesOrderEntity entity = findByOrderId(orderId);
        entity.setStatus("Cancelled");
        entity.setUpdatedAt(Instant.now());
        salesOrderRepository.save(entity);
    }

    private SalesOrderEntity findByOrderId(String orderId) {
        return salesOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sales order not found: " + orderId));
    }

    private SalesOrderEntity fromJson(SalesOrderEntity entity, JsonNode body) {
        if (body.hasNonNull("no") || body.hasNonNull("orderNo")) {
            entity.setOrderNo(body.hasNonNull("orderNo") ? body.get("orderNo").asText() : body.get("no").asText());
        }
        if (body.hasNonNull("date") || body.hasNonNull("orderDate")) {
            String date = body.hasNonNull("orderDate") ? body.get("orderDate").asText() : body.get("date").asText();
            entity.setOrderDate(LocalDate.parse(date));
        } else if (entity.getOrderDate() == null) {
            entity.setOrderDate(LocalDate.now());
        }
        if (body.hasNonNull("customerId")) {
            String customerKey = body.get("customerId").asText();
            entity.setLegacyCustomerId(customerKey);
            customerRepository.findByCustomerId(customerKey).ifPresent(entity::setCustomer);
        }
        if (body.hasNonNull("quotationId")) entity.setQuotationId(body.get("quotationId").asText());
        if (body.hasNonNull("status")) entity.setStatus(body.get("status").asText());
        if (body.hasNonNull("stage")) entity.setStage(body.get("stage").asText());
        if (body.hasNonNull("currencyCode") || body.hasNonNull("currency")) {
            entity.setCurrencyCode(body.hasNonNull("currencyCode") ? body.get("currencyCode").asText() : body.get("currency").asText());
        }
        if (body.has("subtotal")) entity.setSubtotal(body.get("subtotal").decimalValue());
        if (body.has("taxAmount")) entity.setTaxAmount(body.get("taxAmount").decimalValue());
        if (body.has("total")) entity.setTotal(body.get("total").decimalValue());
        if (body.has("totals") && body.get("totals").isObject()) {
            JsonNode totals = body.get("totals");
            if (totals.has("sub")) entity.setSubtotal(totals.get("sub").decimalValue());
            if (totals.has("tax")) entity.setTaxAmount(totals.get("tax").decimalValue());
            if (totals.has("grand")) entity.setTotal(totals.get("grand").decimalValue());
        }
        if (body.has("lines")) entity.setLines(JsonUtils.write(objectMapper, body.get("lines"), "[]"));
        if (body.has("timeline")) entity.setTimeline(JsonUtils.write(objectMapper, body.get("timeline"), "[]"));
        if (body.has("meta")) {
            entity.setMeta(JsonUtils.write(objectMapper, body.get("meta"), "{}"));
        } else {
            entity.setMeta(JsonUtils.write(objectMapper, body, "{}"));
        }
        if (entity.getStatus() == null || entity.getStatus().isBlank()) {
            entity.setStatus("Draft");
        }
        return entity;
    }

    private SalesOrderDto toDto(SalesOrderEntity entity) {
        CustomerEntity customer = entity.getCustomer();
        return new SalesOrderDto(
                entity.getId(),
                entity.getOrderId(),
                entity.getOrderNo(),
                entity.getOrderDate(),
                entity.getLegacyCustomerId(),
                customer != null ? customer.getName() : null,
                entity.getQuotationId(),
                entity.getStatus(),
                entity.getStage(),
                entity.getCurrencyCode(),
                entity.getSubtotal() != null ? entity.getSubtotal() : BigDecimal.ZERO,
                entity.getTaxAmount() != null ? entity.getTaxAmount() : BigDecimal.ZERO,
                entity.getTotal() != null ? entity.getTotal() : BigDecimal.ZERO,
                JsonUtils.parseArrayOrEmpty(objectMapper, entity.getLines()),
                JsonUtils.parseArrayOrEmpty(objectMapper, entity.getTimeline()),
                JsonUtils.parseOrEmpty(objectMapper, entity.getMeta()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private String text(JsonNode node, String... keys) {
        for (String key : keys) {
            if (node.hasNonNull(key)) {
                String value = node.get(key).asText();
                if (!value.isBlank()) return value;
            }
        }
        return null;
    }
}
