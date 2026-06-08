package com.veraglo.erp.config;

import java.nio.file.Path;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final FrontendStaticSupport frontend;

    public WebConfig(FrontendStaticSupport frontend) {
        this.frontend = frontend;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = frontend.getFrontendRoot();
        String location = "file:" + root + "/";
        registry.addResourceHandler("/assets/**", "/src/**", "/legacy/**")
                .addResourceLocations(location + "assets/", location + "src/", location + "legacy/")
                .setCachePeriod(0);
    }
}
