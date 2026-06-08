package com.veraglo.erp.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import org.springframework.stereotype.Component;

/**
 * Compatible with legacy Node/browser SHA-256(salt:password) scheme used by the React store.
 */
@Component
public class PasswordHasher {

    private final SecureRandom random = new SecureRandom();

    public String newSalt() {
        byte[] bytes = new byte[16];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public String hash(String salt, String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((salt + ":" + password).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash password", e);
        }
    }

    public boolean matches(String salt, String password, String expectedHash) {
        return hash(salt, password).equalsIgnoreCase(expectedHash);
    }
}
