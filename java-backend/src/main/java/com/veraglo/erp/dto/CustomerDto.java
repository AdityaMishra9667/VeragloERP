package com.veraglo.erp.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;

public record CustomerDto(
        Long id,
        String customerId,
        String code,
        String name,
        String legalName,
        String gstin,
        String pan,
        String email,
        String phone,
        BigDecimal creditLimit,
        String paymentTerms,
        String status,
        JsonNode billingAddress,
        JsonNode shippingAddresses,
        JsonNode contacts,
        JsonNode meta,
        Instant createdAt,
        Instant updatedAt
) {}
