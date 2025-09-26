package com.example.restapi.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "verification_code")
    private String verificationCode;
    @Column(name = "verification_expired")
    private LocalDateTime verificationCodeExpiresAt;

    // enabled = true means a user can log in
    private boolean enabled;

    // blocked = true means a user can not download files yet
    @Column(name = "blocked", nullable = false)
    private boolean blocked;


    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public User(){
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    //TODO: add proper boolean checks
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {

        if (!enabled) {
            return false;
        }
        if (verificationCode != null && verificationCodeExpiresAt != null
                && verificationCodeExpiresAt.isBefore(LocalDateTime.now())) {
            return false;
        }
        return true;
    }

    public boolean isBlocked(){
        if(blocked){
            return true;
        }
        return false;
    }

}