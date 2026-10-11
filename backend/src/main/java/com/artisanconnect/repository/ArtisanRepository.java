package com.artisanconnect.repository;

import com.artisanconnect.model.Artisan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtisanRepository extends JpaRepository<Artisan, Long> {
    java.util.Optional<Artisan> findByEmail(String email);
}
