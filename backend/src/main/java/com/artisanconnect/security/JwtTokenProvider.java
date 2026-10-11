package com.artisanconnect.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.List;
import java.util.Date;
import com.artisanconnect.security.UserPrincipal;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long validityInMs = 86400000; // 24 h

    public JwtTokenProvider(@Value("${jwt.secret}") String secret) {
        // Decode the Base64 string and build a proper HS512 key.
        // This will throw an IllegalArgumentException if the key is < 64 bytes.
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createToken(String username, List<String> roles) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("auth", roles);

        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMs);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // log the problem if you like
            return false;
        }
    }

    /**
     * Extract the username (email) from a parsed JWT.
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * Generate a JWT for a fully‑loaded {@link UserPrincipal}.
     * This is used after registration/login when we already have the
     * authenticated principal object.
     */
    public String generateToken(UserPrincipal principal) {
        // The principal already knows the username and authorities.
        String username = principal.getUsername();
        List<String> roles = principal.getAuthorities().stream()
                .map(granted -> granted.getAuthority())
                .collect(java.util.stream.Collectors.toList());
        return createToken(username, roles);
    }

    // Optional helper to expose roles list if needed elsewhere
    public List<String> getRolesFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        Object auth = claims.get("auth");
        if (auth instanceof java.util.List) {
            return ((java.util.List<?>) auth).stream()
                    .map(Object::toString)
                    .collect(java.util.stream.Collectors.toList());
        }
        return java.util.Collections.emptyList();
    }

}