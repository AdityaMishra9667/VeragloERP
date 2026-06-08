package com.veraglo.erp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.veraglo.erp.service.ErpStateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final ErpStateService erpStateService;
    private final ObjectMapper objectMapper;

    public WeatherController(ErpStateService erpStateService, ObjectMapper objectMapper) {
        this.erpStateService = erpStateService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/settings")
    public ObjectNode settings() {
        return (ObjectNode) erpStateService.readSettingsNode("weatherLogin", objectMapper.createObjectNode());
    }

    @GetMapping("/current")
    public ObjectNode current() {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("ok", true);
        node.put("source", "open-meteo");
        node.put("tempC", 28);
        node.put("condition", "Partly cloudy");
        return node;
    }
}
