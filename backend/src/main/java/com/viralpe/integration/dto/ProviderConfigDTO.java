package com.viralpe.integration.dto;

import java.util.List;

public class ProviderConfigDTO {
    private String providerId;
    private String providerName;
    private boolean enabled;
    private int priority;
    private List<String> supportedCategories;
    private String healthStatus; // HEALTHY, DEGRADED, DOWN
    private double successRate24h;
    private double offerMarginPercentage;
    private long maxTimeoutMs;
    private String routingStrategy; // PRIORITY_BASED, OFFER_MARGIN_BASED
    private long averageLatencyMs;
    private String lastFailureTimestamp;
    private int consecutiveTimeouts;

    public ProviderConfigDTO() {}

    public ProviderConfigDTO(String providerId, String providerName, boolean enabled, int priority, List<String> supportedCategories, String healthStatus, double successRate24h, double offerMarginPercentage, long maxTimeoutMs) {
        this.providerId = providerId;
        this.providerName = providerName;
        this.enabled = enabled;
        this.priority = priority;
        this.supportedCategories = supportedCategories;
        this.healthStatus = healthStatus;
        this.successRate24h = successRate24h;
        this.offerMarginPercentage = offerMarginPercentage;
        this.maxTimeoutMs = maxTimeoutMs;
        this.routingStrategy = "PRIORITY_BASED";
        this.averageLatencyMs = 45;
        this.consecutiveTimeouts = 0;
    }

    public long getAverageLatencyMs() {
        return averageLatencyMs;
    }

    public void setAverageLatencyMs(long averageLatencyMs) {
        this.averageLatencyMs = averageLatencyMs;
    }

    public String getLastFailureTimestamp() {
        return lastFailureTimestamp;
    }

    public void setLastFailureTimestamp(String lastFailureTimestamp) {
        this.lastFailureTimestamp = lastFailureTimestamp;
    }

    public int getConsecutiveTimeouts() {
        return consecutiveTimeouts;
    }

    public void setConsecutiveTimeouts(int consecutiveTimeouts) {
        this.consecutiveTimeouts = consecutiveTimeouts;
    }

    public String getRoutingStrategy() {
        return routingStrategy;
    }

    public void setRoutingStrategy(String routingStrategy) {
        this.routingStrategy = routingStrategy;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public List<String> getSupportedCategories() {
        return supportedCategories;
    }

    public void setSupportedCategories(List<String> supportedCategories) {
        this.supportedCategories = supportedCategories;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public double getSuccessRate24h() {
        return successRate24h;
    }

    public void setSuccessRate24h(double successRate24h) {
        this.successRate24h = successRate24h;
    }

    public double getOfferMarginPercentage() {
        return offerMarginPercentage;
    }

    public void setOfferMarginPercentage(double offerMarginPercentage) {
        this.offerMarginPercentage = offerMarginPercentage;
    }

    public long getMaxTimeoutMs() {
        return maxTimeoutMs;
    }

    public void setMaxTimeoutMs(long maxTimeoutMs) {
        this.maxTimeoutMs = maxTimeoutMs;
    }
}
