package com.veraglo.erp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.veraglo.erp.dto.PageResponse;
import com.veraglo.erp.dto.SalesOrderDto;
import com.veraglo.erp.service.SalesOrderService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sales-orders")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','ACCOUNTS','DISPATCH','PRODUCTION','VIEWER')")
    public PageResponse<SalesOrderDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stage,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return salesOrderService.list(q, status, stage, page, size);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES','ACCOUNTS','DISPATCH','PRODUCTION','VIEWER')")
    public SalesOrderDto get(@PathVariable String orderId) {
        return salesOrderService.getByOrderId(orderId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public SalesOrderDto create(@RequestBody JsonNode body) {
        return salesOrderService.create(body);
    }

    @PutMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public SalesOrderDto update(@PathVariable String orderId, @RequestBody JsonNode body) {
        return salesOrderService.update(orderId, body);
    }

    @PatchMapping("/{orderId}/stage")
    @PreAuthorize("hasAnyRole('ADMIN','SALES','DISPATCH','PRODUCTION')")
    public SalesOrderDto updateStage(@PathVariable String orderId, @RequestBody Map<String, String> body) {
        return salesOrderService.updateStage(orderId, body.get("stage"));
    }

    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public void delete(@PathVariable String orderId) {
        salesOrderService.delete(orderId);
    }
}
