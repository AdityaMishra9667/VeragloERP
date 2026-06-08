package com.veraglo.erp.config;

import java.nio.file.Path;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final VeragloProperties properties;

    public WebConfig(VeragloProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = Path.of(properties.getFrontend().getStaticPath()).toAbsolutePath().normalize();
        String location = "file:" + root + "/";
        registry.addResourceHandler("/assets/**", "/src/**", "/legacy/**")
                .addResourceLocations(location + "assets/", location + "src/", location + "legacy/")
                .setCachePeriod(0);
        registry.addResourceHandler("/index.html")
                .addResourceLocations(location)
                .setCachePeriod(0);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
    }
}
