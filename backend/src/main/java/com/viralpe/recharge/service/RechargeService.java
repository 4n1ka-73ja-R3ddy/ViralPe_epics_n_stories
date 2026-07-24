package com.viralpe.recharge.service;

import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.dto.CheckoutResponse;
import com.viralpe.payment.service.CheckoutService;
import com.viralpe.recharge.dto.RechargeOperatorResponse;
import com.viralpe.recharge.dto.RechargePlanResponse;
import com.viralpe.recharge.dto.RechargePreviewResponse;
import com.viralpe.recharge.dto.RechargeRequest;
import com.viralpe.recharge.model.RechargeTransaction;
import com.viralpe.recharge.repository.RechargeTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class RechargeService {

    private final RechargeProviderService providerService;
    private final RechargeTransactionRepository rechargeRepository;
    private final CheckoutService checkoutService;

    public RechargeService(
            RechargeProviderService providerService,
            RechargeTransactionRepository rechargeRepository,
            CheckoutService checkoutService
    ) {
        this.providerService = providerService;
        this.rechargeRepository = rechargeRepository;
        this.checkoutService = checkoutService;
    }

    public List<RechargeOperatorResponse> getOperators() {
        return providerService.getOperators();
    }

    public List<String> getCircles() {
        return providerService.getCircles();
    }

    public List<RechargePlanResponse> getPlans(
            String operatorCode,
            String circle
    ) {
        return providerService.getPlans(operatorCode, circle);
    }

    public RechargePreviewResponse previewRecharge(
            RechargeRequest request
    ) {

        List<RechargePlanResponse> plans =
                providerService.getPlans(
                        request.getOperator(),
                        request.getCircle()
                );

        RechargePlanResponse selectedPlan =
                plans.stream()
                        .filter(p -> p.getId().equals(request.getPlanId()))
                        .findFirst()
                        .orElseThrow(() ->
                                new IllegalArgumentException("Invalid Plan"));

        return new RechargePreviewResponse(
                request.getUserId(),
                request.getMobileNumber(),
                request.getOperator(),
                request.getCircle(),
                selectedPlan.getId(),
                selectedPlan.getAmount(),
                selectedPlan.getValidity(),
                selectedPlan.getDescription()
        );

    }

    @Transactional
    public RechargeTransaction recharge(
            RechargeRequest request
    ) {

        RechargePreviewResponse preview =
                previewRecharge(request);

        CheckoutRequest checkoutRequest =
                new CheckoutRequest();

        checkoutRequest.setUserId(
                request.getUserId()
        );

        checkoutRequest.setAmount(
                preview.getAmount()
        );

        checkoutRequest.setProvider(
                request.getOperator()
        );

        checkoutRequest.setUseReversalWallet(true);

        CheckoutResponse checkoutResponse =
                checkoutService.processCheckout(
                        checkoutRequest
                );

        if (!"SUCCESS".equalsIgnoreCase(
                checkoutResponse.getStatus())) {

            throw new RuntimeException(
                    "Checkout Failed"
            );
        }

        String providerReference =
                providerService.performRecharge(
                        request.getMobileNumber(),
                        preview.getAmount()
                );

        RechargeTransaction recharge =
                new RechargeTransaction();

        recharge.setUserId(
                request.getUserId()
        );

        recharge.setMobileNumber(
                request.getMobileNumber()
        );

        recharge.setOperator(
                request.getOperator()
        );

        recharge.setCircle(
                request.getCircle()
        );

        recharge.setAmount(
                preview.getAmount()
        );

        recharge.setStatus(
                "SUCCESS"
        );

        recharge.setPaymentTransactionId(
                checkoutResponse.getTransactionId()
        );

        recharge.setProviderReference(
                providerReference
        );

        recharge.setCreatedAt(
                OffsetDateTime.now()
        );

        recharge.setUpdatedAt(
                OffsetDateTime.now()
        );

        return rechargeRepository.save(
                recharge
        );

    }

    public RechargeTransaction getStatus(
            Long id
    ) {

        return rechargeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Recharge Not Found"
                        ));

    }

    public List<RechargeTransaction> getHistory(
            Long userId
    ) {

        return rechargeRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );

    }

}
