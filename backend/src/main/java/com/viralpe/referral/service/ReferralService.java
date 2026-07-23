package com.viralpe.referral.service;

import com.viralpe.referral.dto.ReferralBonusResponse;
import com.viralpe.referral.dto.ReferralEarningsHistoryResponse;
import com.viralpe.referral.model.ReferralBonus;
import com.viralpe.referral.repository.ReferralBonusRepository;
import com.viralpe.wallet.service.WalletService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReferralService {

    private static final double DEFAULT_REFERRAL_PERCENTAGE = 20.0;

    private final WalletService walletService;
    private final ReferralBonusRepository referralBonusRepository;

    public ReferralService(
            WalletService walletService,
            ReferralBonusRepository referralBonusRepository) {

        this.walletService = walletService;
        this.referralBonusRepository = referralBonusRepository;
    }

    /*
     * Existing method retained so that older code using this method
     * continues to work.
     */
    public void creditReferral(
            Long referrerUserId,
            Double bonusAmount) {

        if (referrerUserId == null ||
                bonusAmount == null ||
                bonusAmount <= 0) {
            return;
        }

        walletService.creditWalletBalance(
                referrerUserId,
                bonusAmount,
                "referral_bonus",
                "referral"
        );
    }

    /*
     * Calculates the referral bonus using:
     *
     * Profit Margin = Gross Paid - API Cost
     * Referral Bonus = Profit Margin × Referral Percentage
     */
    public ReferralBonus calculateAndCreditReferral(
            Long referrerUserId,
            Long refereeUserId,
            Long sourceTransactionId,
            Double grossPaid,
            Double apiCost) {

        validateReferralRequest(
                referrerUserId,
                refereeUserId,
                sourceTransactionId,
                grossPaid,
                apiCost
        );

        double profitMargin = grossPaid - apiCost;

        if (profitMargin <= 0) {
            return null;
        }

        double referralBonusAmount =
                profitMargin *
                        DEFAULT_REFERRAL_PERCENTAGE / 100.0;

        walletService.creditWalletBalance(
                referrerUserId,
                referralBonusAmount,
                "referral_bonus",
                String.valueOf(sourceTransactionId)
        );

        ReferralBonus referralBonus = new ReferralBonus();

        referralBonus.setReferrerUserId(referrerUserId);
        referralBonus.setRefereeUserId(refereeUserId);
        referralBonus.setSourceTransactionId(
                sourceTransactionId
        );
        referralBonus.setTransactionAmount(grossPaid);
        referralBonus.setApiCost(apiCost);
        referralBonus.setProfitMargin(profitMargin);
        referralBonus.setReferralPercentage(
                DEFAULT_REFERRAL_PERCENTAGE
        );
        referralBonus.setReferralBonus(
                referralBonusAmount
        );
        referralBonus.setCreatedAt(
                OffsetDateTime.now()
        );

        return referralBonusRepository.save(referralBonus);
    }

    public ReferralEarningsHistoryResponse getHistory(
            Long referrerUserId) {

        validateReferrerUserId(referrerUserId);

        List<ReferralBonus> bonuses =
                referralBonusRepository
                        .findByReferrerUserIdOrderByCreatedAtDesc(
                                referrerUserId
                        );

        return buildHistoryResponse(
                referrerUserId,
                bonuses
        );
    }

    public ReferralEarningsHistoryResponse getHistory(
            Long referrerUserId,
            OffsetDateTime startDate,
            OffsetDateTime endDate) {

        validateReferrerUserId(referrerUserId);

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required."
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date."
            );
        }

        List<ReferralBonus> bonuses =
                referralBonusRepository
                        .findByReferrerUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                                referrerUserId,
                                startDate,
                                endDate
                        );

        return buildHistoryResponse(
                referrerUserId,
                bonuses
        );
    }

    private ReferralEarningsHistoryResponse buildHistoryResponse(
            Long referrerUserId,
            List<ReferralBonus> bonuses) {

        List<ReferralBonusResponse> earnings =
                new ArrayList<>();

        double runningTotal = 0.0;

        for (ReferralBonus bonus : bonuses) {

            ReferralBonusResponse response =
                    new ReferralBonusResponse();

            response.setReferralBonusId(
                    bonus.getId()
            );
            response.setReferrerUserId(
                    bonus.getReferrerUserId()
            );
            response.setRefereeUserId(
                    bonus.getRefereeUserId()
            );
            response.setSourceTransactionId(
                    bonus.getSourceTransactionId()
            );
            response.setReferralBonus(
                    bonus.getReferralBonus()
            );
            response.setProfitMargin(
                    bonus.getProfitMargin()
            );
            response.setReferralPercentage(
                    bonus.getReferralPercentage()
            );
            response.setCreatedAt(
                    bonus.getCreatedAt()
            );

            runningTotal += bonus.getReferralBonus();

            earnings.add(response);
        }

        ReferralEarningsHistoryResponse history =
                new ReferralEarningsHistoryResponse();

        history.setReferrerUserId(referrerUserId);
        history.setTotalReferralEarnings(runningTotal);
        history.setEarnings(earnings);

        return history;
    }

    private void validateReferralRequest(
            Long referrerUserId,
            Long refereeUserId,
            Long sourceTransactionId,
            Double grossPaid,
            Double apiCost) {

        if (referrerUserId == null) {
            throw new IllegalArgumentException(
                    "Referrer user ID is required."
            );
        }

        if (refereeUserId == null) {
            throw new IllegalArgumentException(
                    "Referee user ID is required."
            );
        }

        if (sourceTransactionId == null) {
            throw new IllegalArgumentException(
                    "Source transaction ID is required."
            );
        }

        if (grossPaid == null || grossPaid <= 0) {
            throw new IllegalArgumentException(
                    "Gross paid must be greater than zero."
            );
        }

        if (apiCost == null || apiCost < 0) {
            throw new IllegalArgumentException(
                    "API cost cannot be negative."
            );
        }
    }

    private void validateReferrerUserId(
            Long referrerUserId) {

        if (referrerUserId == null) {
            throw new IllegalArgumentException(
                    "Referrer user ID is required."
            );
        }
    }
}