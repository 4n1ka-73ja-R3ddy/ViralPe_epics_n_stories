package com.viralpe.integration.controller;

import com.viralpe.integration.orchestration.ProviderOrchestrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/providers/simulate-fault")
public class ProviderFailureSimulationController {

    private final ProviderOrchestrationService orchestrationService;

    public ProviderFailureSimulationController(ProviderOrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getSimulatedFaults() {
        return ResponseEntity.ok(orchestrationService.getSimulatedFaults());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> setSimulatedFault(
            @RequestBody Map<String, String> request
    ) {
        String providerId = request.get("providerId");
        String faultMode = request.get("faultMode");

        if (providerId == null || providerId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "providerId is required."));
        }

        String mode = (faultMode == null || faultMode.trim().isEmpty()) ? "NONE" : faultMode.trim().toUpperCase();
        orchestrationService.setSimulatedFault(providerId.trim().toUpperCase(), mode);

        return ResponseEntity.ok(Map.of(
                "message", "Simulated fault mode set successfully.",
                "providerId", providerId.trim().toUpperCase(),
                "faultMode", mode
        ));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearAllFaults() {
        orchestrationService.clearAllSimulatedFaults();
        return ResponseEntity.ok(Map.of("message", "All simulated provider faults cleared."));
    }
}
