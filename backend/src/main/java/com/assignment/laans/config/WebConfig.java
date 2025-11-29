package com.assignment.laans.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    public WebConfig(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // file.storage.root-path from application.yml
        // e.g. /home/dico/Desktop/log
        String rootPath = storageProperties.getRootPath();

        // Must be "file:/absolute/path/"
        String location = "file:" + rootPath + "/";

        registry
                .addResourceHandler("/images/**") // URL path (inside context /api)
                .addResourceLocations(location); // filesystem path
    }
}
