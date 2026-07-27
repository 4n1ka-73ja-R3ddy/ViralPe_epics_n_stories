package com.viralpe.royalty.dto;

public class VerticalRoyaltyCalculationResult {

    private String category;
    private double transactionAmount;
    private double grossProfitMargin;
    private double profitMarginPercentage;
    private double verticalRoyaltyPercentage;
    private double verticalRoyaltyDeduction;
    private double effectiveProfitMargin;

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getTransactionAmount() {
        return transactionAmount;
    }

    public void setTransactionAmount(double transactionAmount) {
        this.transactionAmount = transactionAmount;
    }

    public double getGrossProfitMargin() {
        return grossProfitMargin;
    }

    public void setGrossProfitMargin(double grossProfitMargin) {
        this.grossProfitMargin = grossProfitMargin;
    }

    public double getProfitMarginPercentage() {
        return profitMarginPercentage;
    }

    public void setProfitMarginPercentage(double profitMarginPercentage) {
        this.profitMarginPercentage = profitMarginPercentage;
    }

    public double getVerticalRoyaltyPercentage() {
        return verticalRoyaltyPercentage;
    }

    public void setVerticalRoyaltyPercentage(double verticalRoyaltyPercentage) {
        this.verticalRoyaltyPercentage = verticalRoyaltyPercentage;
    }

    public double getVerticalRoyaltyDeduction() {
        return verticalRoyaltyDeduction;
    }

    public void setVerticalRoyaltyDeduction(double verticalRoyaltyDeduction) {
        this.verticalRoyaltyDeduction = verticalRoyaltyDeduction;
    }

    public double getEffectiveProfitMargin() {
        return effectiveProfitMargin;
    }

    public void setEffectiveProfitMargin(double effectiveProfitMargin) {
        this.effectiveProfitMargin = effectiveProfitMargin;
    }
}
