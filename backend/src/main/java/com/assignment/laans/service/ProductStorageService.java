package com.assignment.laans.service;

import com.assignment.laans.config.StorageProperties;
import com.assignment.laans.models.Product;
import com.assignment.laans.models.ProductMetadata;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductStorageService {

    private final Path rootLocation;
    private final ObjectMapper objectMapper;

    public ProductStorageService(StorageProperties properties, ObjectMapper objectMapper) {
        this.rootLocation = Paths.get(properties.getRootPath());
        this.objectMapper = objectMapper;
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

        String originalFilename = StringUtils.cleanPath(image.getOriginalFilename());
        if (originalFilename.isEmpty()) {
            originalFilename = "image_" + productId + ".jpg";
        }

        Path imagePath = productDir.resolve(originalFilename);
        Files.copy(image.getInputStream(), imagePath, StandardCopyOption.REPLACE_EXISTING);

        Instant now = Instant.now();
        String imageUrl = "/images/" + productId + "/" + originalFilename;

        Product product = new Product(productId, metadata, originalFilename, imageUrl, now);

        Path jsonPath = productDir.resolve("product.json");
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(jsonPath.toFile(), product);

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

