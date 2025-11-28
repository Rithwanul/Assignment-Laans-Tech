package com.assignment.laans.service;

import com.assignment.laans.config.StorageProperties;
import com.assignment.laans.models.Product;
import com.assignment.laans.models.ProductMetadata;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ProductStorageService {

    private final Path rootLocation;
    private final ObjectMapper objectMapper;

    public ProductStorageService(StorageProperties properties, ObjectMapper objectMapper) {
        this.rootLocation = Paths.get(properties.getRootPath());
        this.objectMapper = objectMapper;

        // Configure mapper ONCE so it supports Java 8 time types like LocalDateTime
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @PostConstruct
    public void init() throws IOException {
        if (!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }
    }

    public Product saveProduct(MultipartFile image, ProductMetadata metadata) throws IOException {
        UUID productId = UUID.randomUUID();
        Path productDir = rootLocation.resolve(productId.toString());
        Files.createDirectories(productDir);

        // ---- Safe filename handling ----
        String originalFilename = Optional.ofNullable(image.getOriginalFilename())
                .map(StringUtils::cleanPath)
                .orElse("");

        if (originalFilename.isBlank()) {
            originalFilename = "image_" + productId + ".jpg";
        }

        Path imagePath = productDir.resolve(originalFilename);

        // Use try-with-resources for the stream
        try (InputStream in = image.getInputStream()) {
            Files.copy(in, imagePath, StandardCopyOption.REPLACE_EXISTING);
        }

        LocalDateTime now = LocalDateTime.now();
        String imageUrl = "/images/" + productId + "/" + originalFilename;

        Product product = new Product(productId, metadata, originalFilename, imageUrl, now);

        // ---- Safe JSON write: serialize -> temp file -> atomic move ----
        Path jsonPath = productDir.resolve("product.json");
        Path tmpJsonPath = productDir.resolve("product.json.tmp");

        try {
            // 1. Serialize in memory
            String json = objectMapper
                    .writerWithDefaultPrettyPrinter()
                    .writeValueAsString(product);

            // 2. Write to temp file first
            Files.writeString(
                    tmpJsonPath,
                    json,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING
            );

            // 3. Atomically move into place
            Files.move(
                    tmpJsonPath,
                    jsonPath,
                    StandardCopyOption.REPLACE_EXISTING,
                    StandardCopyOption.ATOMIC_MOVE
            );

        } catch (Exception ex) {
            // Cleanup temp file if something went wrong
            try {
                Files.deleteIfExists(tmpJsonPath);
            } catch (IOException ignored) {
            }
            System.out.println("Failed to write product JSON: " + ex.getMessage());
            throw ex; // or wrap in a custom exception
        }

        return product;
    }

    public List<Product> findAll() throws IOException {
        List<Product> products = new ArrayList<>();

        if (!Files.exists(rootLocation)) {
            return products;
        }

        try (DirectoryStream<Path> dirStream = Files.newDirectoryStream(rootLocation)) {
            for (Path productDir : dirStream) {
                if (!Files.isDirectory(productDir)) continue;

                Path jsonPath = productDir.resolve("product.json");
                if (Files.exists(jsonPath)) {
                    Product product = objectMapper.readValue(jsonPath.toFile(), Product.class);
                    products.add(product);
                }
            }
        }

        // sort newest first
        products.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return products;
    }
}
