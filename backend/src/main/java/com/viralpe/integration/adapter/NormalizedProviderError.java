package com.viralpe.integration.adapter;

public class NormalizedProviderError {
    private String rawCode;
    private String normalizedCode; // e.g. INVALID_ACCOUNT, INSUFFICIENT_FUNDS, BILLER_DOWN, TIMEOUT, UNKNOWN
    private String message;
    private boolean retryable;

    public NormalizedProviderError() {}

    public NormalizedProviderError(String rawCode, String normalizedCode, String message, boolean retryable) {
        this.rawCode = rawCode;
        this.normalizedCode = normalizedCode;
        this.message = message;
        this.retryable = retryable;
    }

    public String getRawCode() {
        return rawCode;
    }

    public void setRawCode(String rawCode) {
        this.rawCode = rawCode;
    }

    public String getNormalizedCode() {
        return normalizedCode;
    }

    public void setNormalizedCode(String normalizedCode) {
        this.normalizedCode = normalizedCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRetryable() {
        return retryable;
    }

    public void setRetryable(boolean retryable) {
        this.retryable = retryable;
    }
}
