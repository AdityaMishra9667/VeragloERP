package com.veraglo.erp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.veraglo.erp.dto.CustomerDto;
import com.veraglo.erp.dto.PageResponse;
import com.veraglo.erp.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','ACCOUNTS','DISPATCH','VIEWER')")
    public PageResponse<CustomerDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return customerService.list(q, status, page, size);
    }

    @GetMapping("/{key}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES','ACCOUNTS','DISPATCH','VIEWER')")
    public CustomerDto get(@PathVariable String key) {
        return customerService.getByKey(key);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public CustomerDto create(@RequestBody JsonNode body) {
        return customerService.create(body);
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public CustomerDto update(@PathVariable String key, @RequestBody JsonNode body) {
        return customerService.update(key, body);
    }

    @DeleteMapping("/{key}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public void delete(@PathVariable String key) {
        customerService.delete(key);
    }
}
