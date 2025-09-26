package com.example.restapi.file;

import com.example.restapi.usermapping.UserMapping;
import com.example.restapi.usermapping.UserMappingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class UsernameEncoder {

    // HMAC-SHA256 Schlüssel aus application.properties
    private final String hmacKey;

    private final UserMappingRepository userMappingRepository;

    public UsernameEncoder(@Value("${security.hmac.key}") String hmacKey, UserMappingRepository userMappingRepository) {
        this.hmacKey = hmacKey;
        this.userMappingRepository = userMappingRepository;
    }


    public String encode(String originalUsername) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    hmacKey.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(keySpec);
            byte[] hash = mac.doFinal(originalUsername.getBytes(StandardCharsets.UTF_8));


            String username_hash = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

            UserMapping userMapping = new UserMapping(originalUsername, username_hash);
            userMappingRepository.save(userMapping);
            return username_hash;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute HMAC hash for username", e);
        }
    }
}
