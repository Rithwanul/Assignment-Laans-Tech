package com.assignment.laans.models;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public class Product {

    private UUID id;
    private ProductMetadata metadata;
    private String imageFileName;
    private String imageUrl;    // relative URL like /images/{id}/{filename}
    private LocalDateTime createdAt;

    public Product() {
    }

    public Product(UUID id, ProductMetadata metadata, String imageFileName, String imageUrl, LocalDateTime createdAt) {
        this.id = id;
        this.metadata = metadata;
        this.imageFileName = imageFileName;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProductMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(ProductMetadata metadata) {
        this.metadata = metadata;
    }

    public String getImageFileName() {
        return imageFileName;
    }

    public void setImageFileName(String imageFileName) {
        this.imageFileName = imageFileName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

