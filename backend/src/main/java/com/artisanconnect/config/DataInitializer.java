package com.artisanconnect.config;

import com.artisanconnect.model.ArtisanProfile;
import com.artisanconnect.model.Category;
import com.artisanconnect.model.Product;
import com.artisanconnect.model.ProductStatus;
import com.artisanconnect.model.User;
import com.artisanconnect.model.UserRole;
import com.artisanconnect.repository.ArtisanProfileRepository;
import com.artisanconnect.repository.CategoryRepository;
import com.artisanconnect.repository.ProductRepository;
import com.artisanconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private static final String DEMO_PASSWORD = "CraftDemo123!";

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedCategories();
        List<User> artisans = seedArtisans();
        seedProducts(artisans);
    }

    private void seedCategories() {
        Map<String, Category> categories = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getName, Function.identity()));
        List<Category> missing = new ArrayList<>();
        for (CategorySeed seed : CATEGORY_SEEDS) {
            if (!categories.containsKey(seed.name())) {
                missing.add(Category.builder()
                        .name(seed.name()).description(seed.description()).icon(seed.icon()).build());
            }
        }
        categoryRepository.saveAll(missing);
    }

    private List<User> seedArtisans() {
        List<User> artisans = new ArrayList<>();
        for (int i = 0; i < ARTISAN_SEEDS.size(); i++) {
            ArtisanSeed seed = ARTISAN_SEEDS.get(i);
            User user = userRepository.findByEmail(seed.email()).orElseGet(() -> userRepository.save(User.builder()
                    .username(seed.username())
                    .email(seed.email())
                    .phone(seed.phone())
                    .password(passwordEncoder.encode(DEMO_PASSWORD))
                    .role(UserRole.ARTISAN)
                    .active(true)
                    .build()));

            ArtisanProfile profile = artisanProfileRepository.findByUserId(user.getId()).orElseGet(() ->
                    artisanProfileRepository.save(ArtisanProfile.builder()
                            .user(user).craftType(seed.craftType()).bio(seed.bio())
                            .location(seed.location()).state(seed.state())
                            .yearsExperience(seed.yearsExperience()).verified(true).build()));
            if (profile.getCraftType() == null || profile.getCraftType().isBlank()) {
                profile.setCraftType(seed.craftType());
                profile.setBio(seed.bio());
                profile.setLocation(seed.location());
                profile.setState(seed.state());
                profile.setYearsExperience(seed.yearsExperience());
                profile.setVerified(true);
                artisanProfileRepository.save(profile);
            }

            artisans.add(user);
        }
        return artisans;
    }

    private void seedProducts(List<User> artisans) {
        Map<String, Category> categories = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getName, Function.identity()));
        Set<Long> demoArtisanIds = artisans.stream().map(User::getId).collect(Collectors.toSet());
        List<Product> existingProducts = productRepository.findAll();
        Map<String, Product> existingByName = existingProducts.stream()
                .filter(product -> product.getName() != null)
                .collect(Collectors.toMap(product -> product.getName().trim().toLowerCase(),
                        Function.identity(), (first, ignored) -> first));
        List<Product> newProducts = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();
        for (CategorySeed seed : CATEGORY_SEEDS) {
            Category category = categories.get(seed.name());
            for (int itemIndex = 0; itemIndex < seed.products().size(); itemIndex++) {
                ProductSeed item = seed.products().get(itemIndex);
                Product existing = existingByName.get(item.name().trim().toLowerCase());
                if (existing != null) {
                    // Keep existing product details and only refresh the image on demo seed records.
                    if (existing.getArtisan() != null && demoArtisanIds.contains(existing.getArtisan().getId())
                            && !List.of(item.image()).equals(existing.getImages())) {
                        existing.setImages(List.of(item.image()));
                        productsToUpdate.add(existing);
                    }
                    continue;
                }

                User artisan = artisans.get((itemIndex + seed.artisanOffset()) % artisans.size());
                Product product = Product.builder()
                            .artisan(artisan).category(category).name(item.name()).description(item.description())
                            .price(BigDecimal.valueOf(item.price())).stock(8 + itemIndex * 2)
                            .material(item.material()).origin(item.origin()).status(ProductStatus.ACTIVE)
                            .rating(4.6 + (itemIndex % 4) * 0.1).reviewCount(12 + itemIndex * 7)
                            .images(List.of(item.image())).build();
                newProducts.add(product);
                existingByName.put(item.name().trim().toLowerCase(), product);
            }
        }
        // Older demo databases may still contain generic sample listings. Give those
        // records an image that matches their category and name instead of leaving a
        // stale unrelated stock photo in place.
        for (Product existing : existingProducts) {
            if (existing.getArtisan() == null || !demoArtisanIds.contains(existing.getArtisan().getId())
                    || existing.getName() == null) {
                continue;
            }
            String normalizedName = existing.getName().trim().toLowerCase();
            if (!(normalizedName.startsWith("handcrafted ") || normalizedName.startsWith("sample ")
                    || normalizedName.startsWith("demo "))) {
                continue;
            }
            CategorySeed categorySeed = CATEGORY_SEEDS.stream()
                    .filter(candidate -> candidate.name().equalsIgnoreCase(existing.getCategory().getName()))
                    .findFirst().orElse(null);
            if (categorySeed == null) continue;
            ProductSeed matchingSeed = categorySeed.products().stream()
                    .filter(candidate -> normalizedName.contains(candidate.name().toLowerCase().split(" ")[0]))
                    .findFirst().orElse(categorySeed.products().get(0));
            List<String> matchingImage = List.of(matchingSeed.image());
            if (!matchingImage.equals(existing.getImages())) {
                existing.setImages(matchingImage);
                productsToUpdate.add(existing);
            }
        }
        if (!productsToUpdate.isEmpty()) {
            productRepository.saveAll(productsToUpdate);
        }
        productRepository.saveAll(newProducts);
    }

    private record ArtisanSeed(String username, String email, String phone, String displayName,
                               String craftType, String bio, String location, String state, int yearsExperience) {}
    private record ProductSeed(String name, String description, long price, String material,
                               String origin, String image) {}
    private record CategorySeed(String name, String description, String icon, int artisanOffset,
                                List<ProductSeed> products) {}

    private static ProductSeed product(String name, String description, long price, String material,
                                       String origin, String imageId) {
        return new ProductSeed(name, description, price, material, origin,
                "https://images.unsplash.com/" + imageId + "?auto=format&fit=crop&w=900&q=80");
    }

    private static final List<ArtisanSeed> ARTISAN_SEEDS = List.of(
            new ArtisanSeed("meera_clayworks", "meera@artisanconnect.demo", "+919876540101", "Meera Kulkarni", "Pottery", "A family pottery studio making useful, hand-thrown ceramics with regional clay and natural glazes.", "Pune", "Maharashtra", 14),
            new ArtisanSeed("kabir_weaves", "kabir@artisanconnect.demo", "+919876540102", "Kabir Ansari", "Handloom Textiles", "Weaving heirloom cotton and silk textiles on traditional handlooms with a focus on natural color.", "Varanasi", "Uttar Pradesh", 22),
            new ArtisanSeed("ananya_woodcraft", "ananya@artisanconnect.demo", "+919876540103", "Ananya Rao", "Woodcraft", "Small-batch wooden homewares shaped by hand from responsibly sourced Indian hardwoods.", "Mysuru", "Karnataka", 11),
            new ArtisanSeed("farah_jewels", "farah@artisanconnect.demo", "+919876540104", "Farah Shaikh", "Jewelry", "Contemporary keepsakes made with traditional metalwork, beads, and careful hand finishing.", "Jaipur", "Rajasthan", 16),
            new ArtisanSeed("arjun_folkart", "arjun@artisanconnect.demo", "+919876540105", "Arjun Das", "Folk Painting", "Bright narrative paintings inspired by folk stories and the everyday life of eastern India.", "Kolkata", "West Bengal", 18)
    );

    private static final List<CategorySeed> CATEGORY_SEEDS = List.of(
            new CategorySeed("Pottery", "Handmade clay and ceramic products", "🏺", 0, List.of(
                    product("Blue Lotus Studio Vase", "Wheel-thrown stoneware vase finished with a soft indigo glaze.", 1850, "Stoneware clay", "Pune, Maharashtra", "photo-1578749556568-bc2c40e68b61"),
                    product("Terracotta Kulhad Set", "Set of six hand-shaped tea cups fired in a traditional kiln.", 680, "Terracotta", "Kutch, Gujarat", "photo-1578500494198-246f612d3b3d"),
                    product("Speckled Serving Bowl", "A generously sized serving bowl with a food-safe satin glaze.", 1250, "Stoneware clay", "Pune, Maharashtra", "photo-1493106641515-6b5631de4bb9"),
                    product("Hand-painted Clay Planter", "A cheerful planter with drainage and a hand-painted botanical motif.", 790, "Earthenware", "Khurja, Uttar Pradesh", "photo-1485955900006-10f4d324d411"))),
            new CategorySeed("Textiles", "Handwoven fabrics and clothing", "🧵", 1, List.of(
                    product("Indigo Block-print Stole", "Light cotton stole printed by hand with a repeating indigo floral motif.", 1450, "Organic cotton", "Jaipur, Rajasthan", "photo-1601924994987-69e26d50dc26"),
                    product("Kutch Embroidered Cushion Cover", "Colorful hand embroidery brings a one-of-a-kind finish to this cushion cover.", 980, "Cotton and silk thread", "Bhuj, Gujarat", "photo-1584100936595-c0654b55a2e2"),
                    product("Handloom Cotton Table Runner", "A durable table runner woven in natural cotton with tasseled edges.", 1200, "Handloom cotton", "Varanasi, Uttar Pradesh", "photo-1600210492486-724fe5c67fb0"),
                    product("Maheshwari Silk-cotton Dupatta", "A lightweight woven dupatta with a classic gold zari border.", 2650, "Silk cotton", "Maheshwar, Madhya Pradesh", "photo-1610030469983-98e550d6193c"))),
            new CategorySeed("Woodcraft", "Hand-carved wooden items", "🪵", 2, List.of(
                    product("Carved Sheesham Serving Tray", "A sturdy serving tray with carved handles and a smooth natural finish.", 2200, "Sheesham wood", "Saharanpur, Uttar Pradesh", "photo-1610701596007-11502861dcfa"),
                    product("Miniature Painted Elephant", "Hand-carved elephant keepsake painted in a bright folk-art palette.", 850, "Mango wood", "Mysuru, Karnataka", "photo-1610701596007-11502861dcfa"),
                    product("Teak Spice Box", "Compact lidded spice box with seven compartments and a sliding lid.", 1750, "Teak wood", "Mysuru, Karnataka", "photo-1603199506016-b9a594b593c0"),
                    product("Hand-carved Wall Mirror", "A statement mirror framed with hand-carved leaf details.", 3900, "Sheesham wood", "Saharanpur, Uttar Pradesh", "photo-1618221195710-dd6b41faaea6"))),
            new CategorySeed("Jewelry", "Handcrafted ornaments", "💎", 3, List.of(
                    product("Meenakari Lotus Studs", "Petite brass studs with enamel lotus petals and secure posts.", 1100, "Brass and enamel", "Jaipur, Rajasthan", "photo-1535632066927-ab7c9ab60908"),
                    product("Dhokra Leaf Pendant", "A sculptural lost-wax pendant on an adjustable cotton cord.", 1650, "Dhokra brass", "Bastar, Chhattisgarh", "photo-1611652022419-a9419f74343d"),
                    product("Carnelian Bead Necklace", "Warm carnelian beads hand-strung with a traditional brass clasp.", 2450, "Carnelian and brass", "Jaipur, Rajasthan", "photo-1599643478518-a784e5dc4c8f"),
                    product("Silver Filigree Hoops", "Lightweight hoops featuring delicate hand-twisted silver filigree.", 3200, "Sterling silver", "Cuttack, Odisha", "photo-1630019852942-f89202989a59"))),
            new CategorySeed("Paintings", "Traditional and folk art", "🎨", 4, List.of(
                    product("Madhubani Tree of Life", "A detailed original painting filled with birds, vines, and folk motifs.", 3600, "Natural pigments on handmade paper", "Madhubani, Bihar", "photo-1579783900882-c0d3dad7b119"),
                    product("Warli Harvest Dance", "A lively Warli scene painted by hand in the traditional monochrome style.", 2400, "Acrylic on canvas", "Palghar, Maharashtra", "photo-1577083552431-6e5fd01aa342"),
                    product("Pattachitra Story Panel", "A fine-lined folk painting with mineral colors and a traditional border.", 4800, "Natural colors on cloth", "Raghurajpur, Odisha", "photo-1541961017774-22349e4a1262"),
                    product("Kalighat Flower Seller", "A contemporary take on the expressive brushwork of Kalighat painting.", 2950, "Gouache on paper", "Kolkata, West Bengal", "photo-1578301978693-85fa9c0320b9"))),
            new CategorySeed("Leather goods", "Handstitched leather products", "👜", 0, List.of(
                    product("Hand-stitched Everyday Tote", "Roomy vegetable-tanned leather tote with reinforced handles.", 5200, "Vegetable-tanned leather", "Kolkata, West Bengal", "photo-1548036328-c9fa89d128fa"),
                    product("Leather Journal Cover", "Reusable leather cover sized for a pocket notebook, with hand stitching.", 1850, "Full-grain leather", "Kanpur, Uttar Pradesh", "photo-1512820790803-83ca734da794"),
                    product("Card Wallet with Contrast Stitch", "Slim hand-cut wallet with four card slots and a central pocket.", 1450, "Full-grain leather", "Kolkata, West Bengal", "photo-1627123424574-724758594e93"),
                    product("Leather Sling Bag", "Compact crossbody bag with an adjustable strap and brass fittings.", 3900, "Vegetable-tanned leather", "Shantiniketan, West Bengal", "photo-1584917865442-de89df76afd3"))),
            new CategorySeed("Bamboo Craft", "Eco-friendly bamboo products", "🎋", 1, List.of(
                    product("Woven Bamboo Pendant Lamp", "A warm, airy pendant shade woven from slender bamboo strips.", 2600, "Bamboo", "Assam", "photo-1507473885765-e6ed057f782c"),
                    product("Bamboo Desk Organizer", "Handwoven organizer with compartments for stationery and small tools.", 950, "Bamboo and cane", "Tripura", "photo-1513542789411-b6a5d4f31634"),
                    product("Cane Market Basket", "A sturdy everyday basket woven by hand with a comfortable handle.", 1250, "Cane and bamboo", "Assam", "photo-1544816155-12df9643f363"),
                    product("Bamboo Serving Platter", "Lightweight round platter with a braided rim for serving or display.", 780, "Bamboo", "Tripura", "photo-1544816155-12df9643f363"))),
            new CategorySeed("Stone Craft", "Carved stone decoratives", "🪨", 2, List.of(
                    product("Soapstone Tealight Holder", "A softly polished holder carved to let candlelight glow through.", 1150, "Soapstone", "Agra, Uttar Pradesh", "photo-1603006905003-be475563bc59"),
                    product("Marble Inlay Trinket Box", "A keepsake box decorated with delicate hand-cut floral inlay.", 3400, "Makrana marble", "Agra, Uttar Pradesh", "photo-1603006905003-be475563bc59"),
                    product("Black Stone Incense Tray", "Minimal hand-carved incense tray with a subtle natural grain.", 890, "Black granite", "Mahabalipuram, Tamil Nadu", "photo-1608571423902-eed4a5ad8108"),
                    product("Carved Sandstone Bird", "A small sculptural bird carved and finished by hand.", 1750, "Sandstone", "Jaipur, Rajasthan", "photo-1608571423902-eed4a5ad8108")))
    );
}
