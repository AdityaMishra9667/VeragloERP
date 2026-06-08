package com.veraglo.erp.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record SalesOrderDto(
        Long id,
        String orderId,
        String orderNo,
        LocalDate orderDate,
        String customerId,
        String customerName,
        String quotationId,
        String status,
        String stage,
        String currencyCode,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal total,
        JsonNode lines,
        JsonNode timeline,
        JsonNode meta,
        Instant createdAt,
        Instant updatedAt
) {}
