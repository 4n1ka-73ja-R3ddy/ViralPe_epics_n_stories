package com.viralpe.integration.service;

import com.viralpe.admin.controller.ReconciliationController;
import com.viralpe.integration.dto.ReconciliationReportDTO;
import com.viralpe.wallet.model.LedgerEntry;
import com.viralpe.wallet.repository.LedgerEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class ProviderLedgerReconciliationTest {

    private ProviderLedgerReconciliationService reconciliationService;
    private LedgerEntryRepository ledgerEntryRepository;

    @BeforeEach
    public void setUp() {
        ledgerEntryRepository = Mockito.mock(LedgerEntryRepository.class);
        reconciliationService = new ProviderLedgerReconciliationService(ledgerEntryRepository);
    }

    @Test
    @DisplayName("Tasks 3, 6, 10: Reconciliation correctly categorizes MATCHED, DISCREPANCY_AMOUNT, and MISSING entries")
    public void testReconciliationReportGeneration() {
        LedgerEntry entry1 = new LedgerEntry();
        entry1.setId(101L);
        entry1.setUserId(1L);
        entry1.setAmount(-100.0);
        entry1.setCategory("RECHARGE");
        entry1.setSourceReference("REF-MATCHED-01");
        entry1.setCreatedAt(OffsetDateTime.now());

        LedgerEntry entry2 = new LedgerEntry();
        entry2.setId(102L);
        entry2.setUserId(2L);
        entry2.setAmount(-100.0);
        entry2.setCategory("RECHARGE");
        entry2.setSourceReference("REF-DISCREPANCY-02");
        entry2.setCreatedAt(OffsetDateTime.now());

        LedgerEntry entry3 = new LedgerEntry();
        entry3.setId(103L);
        entry3.setUserId(3L);
        entry3.setAmount(-50.0);
        entry3.setCategory("UTILITY");
        entry3.setSourceReference("REF-MISSING-PROV-03");
        entry3.setCreatedAt(OffsetDateTime.now());

        when(ledgerEntryRepository.findAll()).thenReturn(List.of(entry1, entry2, entry3));

        // Record provider logs
        reconciliationService.recordProviderLog("KWIK", "REF-MATCHED-01", BigDecimal.valueOf(100.0), "SUCCESS");
        reconciliationService.recordProviderLog("GOTER", "REF-DISCREPANCY-02", BigDecimal.valueOf(80.0), "SUCCESS");
        reconciliationService.recordProviderLog("KWIK", "REF-UNLINKED-PROV-04", BigDecimal.valueOf(200.0), "SUCCESS");

        ReconciliationReportDTO report = reconciliationService.generateReconciliationReport();

        assertNotNull(report);
        assertEquals(3, report.getTotalInternalCount());
        assertEquals(3, report.getTotalProviderCount());
        assertEquals(1, report.getMatchedCount());
        assertEquals(1, report.getDiscrepancyCount());
        assertEquals(1, report.getMissingInProviderCount());
        assertEquals(1, report.getMissingInLedgerCount());

        // Variance: |100 - 80| = 20
        assertEquals(BigDecimal.valueOf(20.0), report.getTotalMonetaryVariance());
    }

    @Test
    @DisplayName("Task 10: ReconciliationController REST endpoints return report and auto-fix count")
    public void testReconciliationControllerEndpoints() {
        LedgerEntry entry = new LedgerEntry();
        entry.setId(201L);
        entry.setUserId(10L);
        entry.setAmount(-150.0);
        entry.setCategory("RECHARGE");
        entry.setSourceReference("REF-CTRL-01");
        entry.setCreatedAt(OffsetDateTime.now());

        when(ledgerEntryRepository.findAll()).thenReturn(List.of(entry));

        ReconciliationController controller = new ReconciliationController(reconciliationService);

        ResponseEntity<ReconciliationReportDTO> reportResp = controller.getReconciliationReport();
        assertEquals(200, reportResp.getStatusCode().value());
        assertNotNull(reportResp.getBody());

        ResponseEntity<Map<String, Object>> fixResp = controller.autoFixDiscrepancies();
        assertEquals(200, fixResp.getStatusCode().value());
        assertTrue(((Number) fixResp.getBody().get("resolvedDiscrepanciesCount")).intValue() >= 0);
    }
}
