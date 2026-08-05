package com.viralpe.integration.kwik;

public class KwikAuthResponse {
    private String token;
    private String tokenType;
    private long expiresIn;
    private String status;

    public KwikAuthResponse() {}

    public KwikAuthResponse(String token, String tokenType, long expiresIn, String status) {
        this.token = token;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.status = status;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
