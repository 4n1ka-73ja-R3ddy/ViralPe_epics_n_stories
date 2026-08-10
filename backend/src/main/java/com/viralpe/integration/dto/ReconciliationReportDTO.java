package com.viralpe.integration.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ReconciliationReportDTO {
    private String generatedAt;
    private int totalInternalCount;
    private int totalProviderCount;
    private int matchedCount;
    private int discrepancyCount;
    private int missingInProviderCount;
    private int missingInLedgerCount;
    private BigDecimal totalMonetaryVariance = BigDecimal.ZERO;
    private List<ReconciliationItemDTO> items = new ArrayList<>();

    public ReconciliationReportDTO() {}

    public String getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(String generatedAt) {
        this.generatedAt = generatedAt;
    }

    public int getTotalInternalCount() {
        return totalInternalCount;
    }

    public void setTotalInternalCount(int totalInternalCount) {
        this.totalInternalCount = totalInternalCount;
    }

    public int getTotalProviderCount() {
        return totalProviderCount;
    }

    public void setTotalProviderCount(int totalProviderCount) {
        this.totalProviderCount = totalProviderCount;
    }

    public int getMatchedCount() {
        return matchedCount;
    }

    public void setMatchedCount(int matchedCount) {
        this.matchedCount = matchedCount;
    }

    public int getDiscrepancyCount() {
        return discrepancyCount;
    }

    public void setDiscrepancyCount(int discrepancyCount) {
        this.discrepancyCount = discrepancyCount;
    }

    public int getMissingInProviderCount() {
        return missingInProviderCount;
    }

    public void setMissingInProviderCount(int missingInProviderCount) {
        this.missingInProviderCount = missingInProviderCount;
    }

    public int getMissingInLedgerCount() {
        return missingInLedgerCount;
    }

    public void setMissingInLedgerCount(int missingInLedgerCount) {
        this.missingInLedgerCount = missingInLedgerCount;
    }

    public BigDecimal getTotalMonetaryVariance() {
        return totalMonetaryVariance;
    }

    public void setTotalMonetaryVariance(BigDecimal totalMonetaryVariance) {
        this.totalMonetaryVariance = totalMonetaryVariance;
    }

    public List<ReconciliationItemDTO> getItems() {
        return items;
    }

    public void setItems(List<ReconciliationItemDTO> items) {
        this.items = items;
    }
}
