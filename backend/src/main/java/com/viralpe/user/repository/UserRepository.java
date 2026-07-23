package com.viralpe.user.repository;

import com.viralpe.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
// developed by anika teja reddy

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByAuthProviderAndAuthProviderId(String authProvider, String authProviderId);
}
