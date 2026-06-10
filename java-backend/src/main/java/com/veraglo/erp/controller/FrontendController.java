package com.veraglo.erp.controller;

import com.veraglo.erp.config.FrontendStaticSupport;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    private final FrontendStaticSupport frontend;

    public FrontendController(FrontendStaticSupport frontend) {
        this.frontend = frontend;
    }

    @GetMapping({"/", "/index.html"})
    public ResponseEntity<?> root() {
        return serveIndexHtml();
    }

    private ResponseEntity<?> serveIndexHtml() {
        if (!frontend.isIndexPresent()) {
            String body = """
                    <!doctype html>
                    <html lang="en"><head><meta charset="utf-8"><title>Veraglo ERP</title></head>
                    <body style="font-family:system-ui,sans-serif;max-width:42rem;margin:3rem auto;padding:0 1rem;">
                    <h1>Frontend not found</h1>
                    <p>The React UI (<code>index.html</code>) was not found at:</p>
                    <pre>%s</pre>
                    <p>Set <code>VERAGLO_FRONTEND_PATH</code> to the repository root, or start with
                    <code>./scripts/start-java.sh</code> / <code>cd server && npm start</code> for the Node API.</p>
                    </body></html>
                    """.formatted(frontend.getIndexHtml());
            return ResponseEntity.status(503)
                    .contentType(new MediaType("text", "html", StandardCharsets.UTF_8))
                    .body(body);
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .contentType(new MediaType("text", "html", StandardCharsets.UTF_8))
                .body(new FileSystemResource(frontend.getIndexHtml()));
    }
}
