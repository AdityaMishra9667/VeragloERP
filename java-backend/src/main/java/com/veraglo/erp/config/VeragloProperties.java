package com.veraglo.erp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "veraglo")
public class VeragloProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Frontend frontend = new Frontend();
    private final Migration migration = new Migration();
    private final Licensing licensing = new Licensing();
    private final DataPath dataPath = new DataPath();

    public Jwt getJwt() { return jwt; }
    public Cors getCors() { return cors; }
    public Frontend getFrontend() { return frontend; }
    public Migration getMigration() { return migration; }
    public Licensing getLicensing() { return licensing; }
    public DataPath getDataPath() { return dataPath; }

    public static class Jwt {
        private String secret;
        private int accessTokenMinutes = 480;
        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public int getAccessTokenMinutes() { return accessTokenMinutes; }
        public void setAccessTokenMinutes(int accessTokenMinutes) { this.accessTokenMinutes = accessTokenMinutes; }
    }

    public static class Cors {
        private String allowedOrigins = "http://localhost:3000";
        public String getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(String allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    }

    public static class Frontend {
        private String staticPath = "../";
        public String getStaticPath() { return staticPath; }
        public void setStaticPath(String staticPath) { this.staticPath = staticPath; }
    }

    public static class Migration {
        private String legacyJsonPath;
        public String getLegacyJsonPath() { return legacyJsonPath; }
        public void setLegacyJsonPath(String legacyJsonPath) { this.legacyJsonPath = legacyJsonPath; }
    }

    public static class Licensing {
        private String secret = "veraglo-erp-lic-v1";
        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
    }

    public static class DataPath {
        private String defaultPath;
        public String getDefault() { return defaultPath; }
        public void setDefault(String defaultPath) { this.defaultPath = defaultPath; }
    }
}
