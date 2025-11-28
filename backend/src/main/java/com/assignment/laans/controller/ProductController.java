package com.assignment.laans.controller;


import com.assignment.laans.models.Product;
import com.assignment.laans.models.ProductMetadata;
import com.assignment.laans.models.ProductPage;
import com.assignment.laans.service.ProductStorageService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductStorageService productStorageService;
    private final ObjectMapper objectMapper;

    public ProductController(ProductStorageService productStorageService, ObjectMapper objectMapper) {
        this.productStorageService = productStorageService;
        this.objectMapper = objectMapper;
    }

    /**
     * Accepts:
     * - images: multiple image files
     * - metadata: JSON array of ProductMetadata objects, same length as images
     */
    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<Product> bulkUpload(
            @RequestPart("images") List<MultipartFile> images,
            @RequestPart("metadata") String metadataJson
    ) throws IOException {

        List<ProductMetadata> metadataList = objectMapper.readValue(
                metadataJson,
                new TypeReference<List<ProductMetadata>>() {}
        );

        if (metadataList.size() != images.size()) {
            throw new IllegalArgumentException("Number of images and metadata items must be the same");
        }

        List<Product> saved = new ArrayList<>();

        for (int i = 0; i < images.size(); i++) {
            saved.add(productStorageService.saveProduct(images.get(i), metadataList.get(i)));
        }

        return saved;
    }

    @GetMapping
    public ProductPage listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) throws IOException {

        List<Product> all = productStorageService.findAll();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, all.size());

        List<Product> content = new ArrayList<>();
        if (fromIndex < all.size()) {
            content = all.subList(fromIndex, toIndex);
        }

        return new ProductPage(content, all.size(), page, size);
    }
}
