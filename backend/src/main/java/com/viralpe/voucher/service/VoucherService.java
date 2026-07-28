package com.viralpe.voucher.service;

import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.dto.CheckoutResponse;
import com.viralpe.payment.service.CheckoutService;
import com.viralpe.voucher.dto.VoucherBrandResponse;
import com.viralpe.voucher.dto.VoucherDenominationResponse;
import com.viralpe.voucher.dto.VoucherPurchaseRequest;
import com.viralpe.voucher.dto.VoucherPurchaseResponse;
import com.viralpe.voucher.integration.VoucherProviderService;
import com.viralpe.voucher.model.VoucherPurchase;
import com.viralpe.voucher.repository.VoucherPurchaseRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class VoucherService {

    private final VoucherProviderService voucherProviderService;
    private final VoucherPurchaseRepository voucherPurchaseRepository;
    private final CheckoutService checkoutService;

    public VoucherService(VoucherProviderService voucherProviderService,
                          VoucherPurchaseRepository voucherPurchaseRepository,
                          CheckoutService checkoutService) {
        this.voucherProviderService = voucherProviderService;
        this.voucherPurchaseRepository = voucherPurchaseRepository;
        this.checkoutService = checkoutService;
    }

    public List<VoucherBrandResponse> getBrands() {
        return voucherProviderService.getBrands();
    }

    public List<VoucherDenominationResponse> getDenominations(String brandId) {
        if (brandId == null || brandId.isBlank()) {
            throw new IllegalArgumentException("Brand ID is required.");
        }

        return voucherProviderService.getDenominations(brandId);
    }

    public VoucherPurchaseResponse purchaseVoucher(
            VoucherPurchaseRequest request
    ) {
        validatePurchaseRequest(request);

        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setUserId(request.getUserId());
        checkoutRequest.setAmount(request.getAmount());
        checkoutRequest.setUseReversalWallet(
                request.isUseReversalWallet()
        );
        checkoutRequest.setProvider(
                request.getPaymentProvider()
        );

        CheckoutResponse checkoutResponse =
                checkoutService.processCheckout(checkoutRequest);

        VoucherPurchase voucherPurchase = new VoucherPurchase();
        voucherPurchase.setUserId(request.getUserId());
        voucherPurchase.setBrand(
                request.getBrandName() == null ||
                request.getBrandName().isBlank()
                        ? request.getBrandId()
                        : request.getBrandName()
        );
        voucherPurchase.setDenomination(
                request.getDenomination()
        );
        voucherPurchase.setAmount(request.getAmount());
        voucherPurchase.setCheckoutTransactionId(
                checkoutResponse.getTransactionId()
        );
        voucherPurchase.setCreatedAt(OffsetDateTime.now());

        if (!"SUCCESS".equalsIgnoreCase(
                checkoutResponse.getStatus()
        )) {
            voucherPurchase.setStatus("FAILED");
            voucherPurchase.setVoucherCode("NOT_GENERATED");
            voucherPurchase.setVoucherPin("NOT_GENERATED");

            VoucherPurchase saved =
                    voucherPurchaseRepository.save(
                            voucherPurchase
                    );

            return createResponse(saved);
        }

        boolean providerSuccess =
                voucherProviderService.purchaseVoucher(
                        request.getBrandId(),
                        request.getDenomination()
                );

        if (providerSuccess) {
            voucherPurchase.setStatus("SUCCESS");
            voucherPurchase.setVoucherCode(
                    voucherProviderService
                            .generateVoucherCode()
            );
            voucherPurchase.setVoucherPin(
                    voucherProviderService
                            .generateVoucherPin()
            );
            voucherPurchase.setProviderReference(
                    voucherProviderService
                            .generateProviderReference()
            );
        } else {
            voucherPurchase.setStatus("FAILED");
            voucherPurchase.setVoucherCode("NOT_GENERATED");
            voucherPurchase.setVoucherPin("NOT_GENERATED");
        }

        VoucherPurchase saved =
                voucherPurchaseRepository.save(voucherPurchase);

        return createResponse(saved);
    }

    public VoucherPurchase getStatus(Long purchaseId) {
        return voucherPurchaseRepository.findById(purchaseId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Voucher purchase not found with ID: "
                                        + purchaseId
                        )
                );
    }

    public List<VoucherPurchase> getHistory(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        return voucherPurchaseRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    private VoucherPurchaseResponse createResponse(
            VoucherPurchase voucherPurchase
    ) {
        VoucherPurchaseResponse response =
                new VoucherPurchaseResponse();

        response.setPurchaseId(voucherPurchase.getId());
        response.setBrand(voucherPurchase.getBrand());
        response.setDenomination(
                voucherPurchase.getDenomination()
        );
        response.setAmount(voucherPurchase.getAmount());
        response.setVoucherCode(
                voucherPurchase.getVoucherCode()
        );
        response.setVoucherPin(
                voucherPurchase.getVoucherPin()
        );
        response.setStatus(voucherPurchase.getStatus());
        response.setProviderReference(
                voucherPurchase.getProviderReference()
        );
        response.setCreatedAt(
                voucherPurchase.getCreatedAt()
        );

        return response;
    }

    private void validatePurchaseRequest(
            VoucherPurchaseRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Voucher purchase request is required."
            );
        }

        if (request.getUserId() == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        if (request.getBrandId() == null ||
                request.getBrandId().isBlank()) {
            throw new IllegalArgumentException(
                    "Brand ID is required."
            );
        }

        if (request.getDenomination() == null ||
                request.getDenomination() <= 0) {
            throw new IllegalArgumentException(
                    "Denomination must be greater than zero."
            );
        }

        if (request.getAmount() == null && request.getDenomination() != null) {
            request.setAmount(request.getDenomination());
        }

        if (request.getAmount() == null ||
                request.getAmount() <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero."
            );
        }

        if (!request.getAmount().equals(
                request.getDenomination()
        )) {
            throw new IllegalArgumentException(
                    "Amount must match the voucher denomination."
            );
        }

        if (request.getPaymentProvider() == null ||
                request.getPaymentProvider().isBlank()) {
            request.setPaymentProvider("MOCK");
        }
    }
}