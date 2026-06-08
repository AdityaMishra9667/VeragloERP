package com.veraglo.erp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaFallbackController {

    @GetMapping({
            "/login",
            "/launcher",
            "/module/**",
            "/admin/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
