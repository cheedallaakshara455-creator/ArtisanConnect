package com.artisanconnect.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "artisan_profiles")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ArtisanProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    private String craftType;
    @Column(length = 1000)
    private String bio;
    private String location;
    private String state;
    private int yearsExperience;
    @Builder.Default
    private boolean verified = false;
    private String bannerImage;
}
