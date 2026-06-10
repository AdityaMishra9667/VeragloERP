package com.veraglo.erp.config;

import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class FrontendStaticSupport {

    private static final Logger log = LoggerFactory.getLogger(FrontendStaticSupport.class);

    private final Path frontendRoot;
    private final Path indexHtml;

    public FrontendStaticSupport(VeragloProperties properties) {
        this.frontendRoot = resolveFrontendRoot(properties.getFrontend().getStaticPath());
        this.indexHtml = frontendRoot.resolve("index.html");
        if (isIndexPresent()) {
            log.info("Serving React UI from {}", frontendRoot);
        } else {
            log.error(
                    "index.html not found at {} — set VERAGLO_FRONTEND_PATH to the repo root "
                            + "(directory containing index.html and src/) or run ./scripts/start-java.sh",
                    indexHtml
            );
        }
    }

    public Path getFrontendRoot() {
        return frontendRoot;
    }

    public Path getIndexHtml() {
        return indexHtml;
    }

    public boolean isIndexPresent() {
        return Files.isRegularFile(indexHtml);
    }

    static Path resolveFrontendRoot(String configured) {
        String raw = configured == null ? "" : configured.trim();
        if (raw.isEmpty()) {
            raw = "..";
        }

        Path candidate = Path.of(raw);
        if (!candidate.isAbsolute()) {
            candidate = Path.of("").toAbsolutePath().resolve(candidate).normalize();
        } else {
            candidate = candidate.normalize();
        }
        if (hasIndex(candidate)) {
            return candidate;
        }

        Path cwd = Path.of("").toAbsolutePath().normalize();
        Path[] fallbacks = {
                cwd,
                cwd.resolve("..").normalize(),
                cwd.getParent(),
                locateRepoFromJar(),
        };
        for (Path fallback : fallbacks) {
            if (fallback != null && hasIndex(fallback)) {
                return fallback.normalize();
            }
        }
        return candidate;
    }

    private static boolean hasIndex(Path dir) {
        return dir != null && Files.isDirectory(dir) && Files.isRegularFile(dir.resolve("index.html"));
    }

    private static Path locateRepoFromJar() {
        try {
            Path code = Path.of(FrontendStaticSupport.class.getProtectionDomain().getCodeSource().getLocation().toURI())
                    .toAbsolutePath()
                    .normalize();
            Path dir = Files.isDirectory(code) ? code : code.getParent();
            for (int i = 0; i < 4 && dir != null; i++) {
                if (hasIndex(dir)) {
                    return dir;
                }
                dir = dir.getParent();
            }
        } catch (Exception ignored) {
            // fall through
        }
        return null;
    }
}
