package com.viralpe.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

// developed by anika teja reddy
    @Bean
    public OpenAPI viralPeOpenApi() {
        return new OpenAPI().info(
                new Info()
                        .title("ViralPe Backend API")
                        .description("REST API documentation for ViralPe backend services.")
                        .version("v1")
                        .contact(new Contact().name("ViralPe Team"))
        );
    }
}
