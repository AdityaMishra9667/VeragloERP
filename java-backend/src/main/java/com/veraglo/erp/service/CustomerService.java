package com.veraglo.erp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veraglo.erp.domain.CustomerEntity;
import com.veraglo.erp.dto.CustomerDto;
import com.veraglo.erp.dto.PageResponse;
import com.veraglo.erp.repository.CustomerRepository;
import com.veraglo.erp.util.JsonUtils;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper;

    public CustomerService(CustomerRepository customerRepository, ObjectMapper objectMapper) {
        this.customerRepository = customerRepository;
        this.objectMapper = objectMapper;
    }

    public PageResponse<CustomerDto> list(String q, String status, int page, int size) {
        var result = customerRepository.search(q, status, PageRequest.of(page, size, Sort.by("name").ascending()));
        return PageResponse.from(result.map(this::toDto));
    }

    public CustomerDto getByKey(String key) {
        return toDto(findByKey(key));
    }

    @Transactional
    public CustomerDto create(JsonNode body) {
        String customerId = text(body, "customerId", "id");
        if (customerId == null || customerId.isBlank()) {
            customerId = "c" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (customerRepository.existsByCustomerId(customerId)) {
            throw new IllegalArgumentException("Customer already exists: " + customerId);
        }
        CustomerEntity entity = fromJson(new CustomerEntity(), body);
        entity.setCustomerId(customerId);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        return toDto(customerRepository.save(entity));
    }

    @Transactional
    public CustomerDto update(String key, JsonNode body) {
        CustomerEntity entity = findByKey(key);
        fromJson(entity, body);
        entity.setUpdatedAt(Instant.now());
        return toDto(customerRepository.save(entity));
    }

    @Transactional
    public void delete(String key) {
        CustomerEntity entity = findByKey(key);
        entity.setStatus("Deleted");
        entity.setUpdatedAt(Instant.now());
        customerRepository.save(entity);
    }

    private CustomerEntity findByKey(String key) {
        return customerRepository.findByCustomerId(key)
                .or(() -> customerRepository.findByCode(key))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + key));
    }

    private CustomerEntity fromJson(CustomerEntity entity, JsonNode body) {
        if (body.hasNonNull("code")) entity.setCode(body.get("code").asText());
        if (body.hasNonNull("name")) entity.setName(body.get("name").asText());
        if (body.hasNonNull("legalName")) entity.setLegalName(body.get("legalName").asText());
        if (body.hasNonNull("gstin")) entity.setGstin(body.get("gstin").asText());
        if (body.hasNonNull("pan")) entity.setPan(body.get("pan").asText());
        if (body.hasNonNull("email")) entity.setEmail(body.get("email").asText());
        if (body.hasNonNull("phone")) entity.setPhone(body.get("phone").asText());
        if (body.hasNonNull("paymentTerms")) entity.setPaymentTerms(body.get("paymentTerms").asText());
        if (body.hasNonNull("status")) entity.setStatus(body.get("status").asText());
        if (body.has("creditLimit")) entity.setCreditLimit(body.get("creditLimit").decimalValue());
        if (body.has("billingAddress") || body.has("billing")) {
            JsonNode billing = body.has("billingAddress") ? body.get("billingAddress") : objectMapper.createObjectNode().put("text", body.get("billing").asText(""));
            entity.setBillingAddress(JsonUtils.write(objectMapper, billing, "{}"));
        }
        if (body.has("shippingAddresses") || body.has("addresses")) {
            JsonNode addresses = body.has("shippingAddresses") ? body.get("shippingAddresses") : body.get("addresses");
            entity.setShippingAddresses(JsonUtils.write(objectMapper, addresses, "[]"));
        }
        if (body.has("contacts")) {
            entity.setContacts(JsonUtils.write(objectMapper, body.get("contacts"), "[]"));
        }
        if (body.has("meta")) {
            entity.setMeta(JsonUtils.write(objectMapper, body.get("meta"), "{}"));
        } else {
            entity.setMeta(JsonUtils.write(objectMapper, body, "{}"));
        }
        if (entity.getName() == null || entity.getName().isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }
        return entity;
    }

    private CustomerDto toDto(CustomerEntity entity) {
        return new CustomerDto(
                entity.getId(),
                entity.getCustomerId(),
                entity.getCode(),
                entity.getName(),
                entity.getLegalName(),
                entity.getGstin(),
                entity.getPan(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getCreditLimit() != null ? entity.getCreditLimit() : BigDecimal.ZERO,
                entity.getPaymentTerms(),
                entity.getStatus(),
                JsonUtils.parseOrEmpty(objectMapper, entity.getBillingAddress()),
                JsonUtils.parseArrayOrEmpty(objectMapper, entity.getShippingAddresses()),
                JsonUtils.parseArrayOrEmpty(objectMapper, entity.getContacts()),
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
