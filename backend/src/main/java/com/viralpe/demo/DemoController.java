package com.viralpe.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final DemoService demoService;

    public DemoController(DemoService demoService) {
        this.demoService = demoService;
    }

    @PostMapping("/load/{userId}")
    public ResponseEntity<Map<String, String>> loadDemoData(
            @PathVariable Long userId
    ) {
        demoService.loadDemoData(userId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Demo wallet data loaded successfully."
                )
        );
    }
}