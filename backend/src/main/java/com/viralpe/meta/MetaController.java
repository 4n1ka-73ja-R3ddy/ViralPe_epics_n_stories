package com.viralpe.meta;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/meta")
public class MetaController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> m = new HashMap<>();
        m.put("app", "viralpe-backend");
        m.put("version", "0.1.0");
        m.put("status", "ok");
        return ResponseEntity.ok(m);
    }
}
