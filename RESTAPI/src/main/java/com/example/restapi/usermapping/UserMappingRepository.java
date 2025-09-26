package com.example.restapi.usermapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMappingRepository extends JpaRepository<UserMapping, String> {
}
