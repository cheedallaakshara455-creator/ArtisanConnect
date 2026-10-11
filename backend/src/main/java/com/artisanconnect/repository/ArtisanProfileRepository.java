package com.artisanconnect.repository;
import com.artisanconnect.model.ArtisanProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ArtisanProfileRepository extends JpaRepository<ArtisanProfile, Long> {
    Optional<ArtisanProfile> findByUserId(Long userId);
}
