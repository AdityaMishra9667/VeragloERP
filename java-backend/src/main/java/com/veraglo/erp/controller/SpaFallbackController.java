package com.veraglo.erp.controller;

import com.veraglo.erp.config.FrontendStaticSupport;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaFallbackController {

    private final FrontendStaticSupport frontend;

    public SpaFallbackController(FrontendStaticSupport frontend) {
        this.frontend = frontend;
    }

    @GetMapping({
            "/login",
            "/launcher",
            "/module/**",
            "/admin/**"
    })
    public ResponseEntity<FileSystemResource> spaRoutes() {
        if (!frontend.isIndexPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .contentType(MediaType.TEXT_HTML)
                .body(new FileSystemResource(frontend.getIndexHtml()));
    }
}
