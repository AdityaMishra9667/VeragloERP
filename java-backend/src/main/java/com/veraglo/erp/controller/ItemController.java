package com.veraglo.erp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.veraglo.erp.dto.ItemDto;
import com.veraglo.erp.dto.PageResponse;
import com.veraglo.erp.service.ItemService;
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
@RequestMapping("/api/v1/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','INVENTORY','PRODUCTION','PURCHASE','VIEWER')")
    public PageResponse<ItemDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return itemService.list(q, status, page, size);
    }

    @GetMapping("/{sku}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES','INVENTORY','PRODUCTION','PURCHASE','VIEWER')")
    public ItemDto get(@PathVariable String sku) {
        return itemService.getBySku(sku);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ItemDto create(@RequestBody JsonNode body) {
        return itemService.create(body);
    }

    @PutMapping("/{sku}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ItemDto update(@PathVariable String sku, @RequestBody JsonNode body) {
        return itemService.update(sku, body);
    }

    @DeleteMapping("/{sku}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public void delete(@PathVariable String sku) {
        itemService.delete(sku);
    }
}
