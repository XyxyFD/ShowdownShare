package com.example.restapi.user;

public record UserDto(
        Long id,
        String username,
        String email,
        String role,
        boolean enabled,
        boolean blocked
) {
    public static UserDto from(User u) {
        return new UserDto(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRole().name(),
                u.isEnabled(),
                u.isBlocked()
        );
    }
}
