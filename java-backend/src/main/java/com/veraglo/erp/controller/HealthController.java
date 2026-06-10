package com.veraglo.erp.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.veraglo.erp.service.ErpStateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final ErpStateService erpStateService;

    public HealthController(ErpStateService erpStateService) {
        this.erpStateService = erpStateService;
    }

    @GetMapping("/api/health")
    public ObjectNode health() {
        return erpStateService.healthPayload("postgresql", true, "veraglo_erp");
    }
}
