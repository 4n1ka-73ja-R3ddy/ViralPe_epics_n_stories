package com.viralpe.integration.controller;

import com.viralpe.integration.dto.*;
import com.viralpe.integration.orchestration.ProviderOrchestrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProviderConfigController {

    private final ProviderOrchestrationService orchestrationService;

    public ProviderConfigController(ProviderOrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    @GetMapping("/admin/providers/config")
    public ResponseEntity<List<ProviderConfigDTO>> getProviderConfigs() {
        return ResponseEntity.ok(orchestrationService.getAllProviderConfigs());
    }

    @PostMapping("/admin/providers/config/{providerId}")
    public ResponseEntity<ProviderConfigDTO> updateProviderConfig(
            @PathVariable String providerId,
            @RequestParam boolean enabled,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) Double margin
    ) {
        ProviderConfigDTO updated = orchestrationService.updateProviderConfig(providerId, enabled, priority, margin);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/provider/orchestrate/execute")
    public ResponseEntity<ProviderExecuteResponseDTO> executeOrchestratedPayment(
            @RequestBody ProviderExecuteRequestDTO request
    ) {
        ProviderExecuteResponseDTO response = orchestrationService.executeOrchestratedPayment(request);
        return ResponseEntity.ok(response);
    }
}
