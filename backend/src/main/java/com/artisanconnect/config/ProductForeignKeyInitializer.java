package com.artisanconnect.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.util.List;

/** Keeps older installations aligned with Product.artisan -> User. */
@Component
@Profile("prod")
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class ProductForeignKeyInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        String database = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
        if (database == null) return;

        List<ForeignKey> keys = jdbcTemplate.query(
                "SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME " +
                        "FROM information_schema.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' " +
                        "AND COLUMN_NAME = 'artisan_id' AND REFERENCED_TABLE_NAME IS NOT NULL",
                (rs, row) -> new ForeignKey(rs.getString("CONSTRAINT_NAME"), rs.getString("REFERENCED_TABLE_NAME")));

        boolean hasUserForeignKey = false;
        for (ForeignKey key : keys) {
            if ("users".equalsIgnoreCase(key.referencedTable())) {
                hasUserForeignKey = true;
            } else {
                // Constraint names come from information_schema, not user input.
                jdbcTemplate.execute("ALTER TABLE products DROP FOREIGN KEY `" + key.name().replace("`", "``") + "`");
            }
        }

        if (!hasUserForeignKey) {
            jdbcTemplate.execute("ALTER TABLE products ADD CONSTRAINT fk_products_artisan_user " +
                    "FOREIGN KEY (artisan_id) REFERENCES users(id)");
        }
    }

    private record ForeignKey(String name, String referencedTable) {}
}
