package com.veraglo.erp.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(VeragloProperties.class)
public class AppConfig {
}
