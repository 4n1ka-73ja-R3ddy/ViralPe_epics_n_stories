package com.viralpe.admin.controller;

import com.viralpe.integration.dto.ReconciliationReportDTO;
import com.viralpe.integration.service.ProviderLedgerReconciliationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reconciliation")
public class ReconciliationController {

    private final ProviderLedgerReconciliationService reconciliationService;

    public ReconciliationController(ProviderLedgerReconciliationService reconciliationService) {
        this.reconciliationService = reconciliationService;
    }

    @GetMapping("/report")
    public ResponseEntity<ReconciliationReportDTO> getReconciliationReport() {
        ReconciliationReportDTO report = reconciliationService.generateReconciliationReport();
        return ResponseEntity.ok(report);
    }

    @PostMapping("/run")
    public ResponseEntity<ReconciliationReportDTO> runReconciliation() {
        ReconciliationReportDTO report = reconciliationService.generateReconciliationReport();
        return ResponseEntity.ok(report);
    }

    @PostMapping("/auto-fix")
    public ResponseEntity<Map<String, Object>> autoFixDiscrepancies() {
        int resolvedCount = reconciliationService.autoReconcileDiscrepancies();
        return ResponseEntity.ok(Map.of(
                "message", "Auto-reconciliation run completed successfully.",
                "resolvedDiscrepanciesCount", resolvedCount
        ));
    }
}
