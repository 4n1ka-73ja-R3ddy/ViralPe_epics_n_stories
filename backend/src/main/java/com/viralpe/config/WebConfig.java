package com.viralpe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AdminRbacInterceptor adminRbacInterceptor;

    public WebConfig(AdminRbacInterceptor adminRbacInterceptor) {
        this.adminRbacInterceptor = adminRbacInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminRbacInterceptor)
                .addPathPatterns("/api/admin/**");
    }
}
