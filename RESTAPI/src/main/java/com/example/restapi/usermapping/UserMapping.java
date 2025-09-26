package com.example.restapi.usermapping;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "username_mapping")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMapping {

    @Id
    @Column(name = "original_username", nullable = false, length = 255)
    private String originalUsername;

    @Column(name = "encrypted_username", nullable = false, length = 255)
    private String encryptedUsername;
}
