package com.viralpe.bill.service;

import com.viralpe.bill.dto.BillCategoryResponse;
import com.viralpe.bill.dto.BillFetchRequest;
import com.viralpe.bill.dto.BillFetchResponse;
import com.viralpe.bill.dto.BillerResponse;
import com.viralpe.bill.dto.BillPaymentRequest;
import com.viralpe.bill.dto.BillReceiptResponse;
import com.viralpe.bill.integration.BillProviderService;
import com.viralpe.bill.model.BillPayment;
import com.viralpe.bill.repository.BillPaymentRepository;
import com.viralpe.payment.dto.CheckoutRequest;
import com.viralpe.payment.dto.CheckoutResponse;
import com.viralpe.payment.service.CheckoutService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillService {

    private final BillProviderService billProviderService;
    private final BillPaymentRepository billPaymentRepository;
    private final CheckoutService checkoutService;

    public BillService(BillProviderService billProviderService,
                       BillPaymentRepository billPaymentRepository,
                       CheckoutService checkoutService) {
        this.billProviderService = billProviderService;
        this.billPaymentRepository = billPaymentRepository;
        this.checkoutService = checkoutService;
    }

    public List<BillCategoryResponse> getCategories() {
        return billProviderService.getCategories();
    }

    public List<BillerResponse> getBillers(String category) {
        List<BillerResponse> billers = billProviderService.getBillers();

        if (category == null || category.isBlank()) {
            return billers;
        }

        return billers.stream()
                .filter(biller -> category.equalsIgnoreCase(biller.getCategory()))
                .collect(Collectors.toList());
    }

    public BillFetchResponse fetchBill(BillFetchRequest request) {
        validateFetchRequest(request);
        return billProviderService.fetchBill(request);
    }

    public BillReceiptResponse payBill(BillPaymentRequest request) {
        validatePaymentRequest(request);

        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setUserId(request.getUserId());
        checkoutRequest.setAmount(request.getAmount());
        checkoutRequest.setUseReversalWallet(request.isUseReversalWallet());
        checkoutRequest.setProvider(request.getPaymentProvider());

        CheckoutResponse checkoutResponse =
                checkoutService.processCheckout(checkoutRequest);

        BillPayment billPayment = new BillPayment();
        billPayment.setUserId(request.getUserId());
        billPayment.setCategory(request.getCategory());
        billPayment.setBiller(
                request.getBillerName() == null ||
                request.getBillerName().isBlank()
                        ? request.getBillerId()
                        : request.getBillerName()
        );
        billPayment.setConsumerNumber(request.getConsumerNumber());
        billPayment.setAmount(request.getAmount());
        billPayment.setCheckoutTransactionId(
                checkoutResponse.getTransactionId()
        );
        billPayment.setCreatedAt(OffsetDateTime.now());

        if (!"SUCCESS".equalsIgnoreCase(checkoutResponse.getStatus())) {
            billPayment.setStatus("FAILED");

            BillPayment saved =
                    billPaymentRepository.save(billPayment);

            return createReceiptResponse(saved);
        }

        boolean providerSuccess = billProviderService.payBill(
                request.getBillReference(),
                request.getAmount()
        );

        if (providerSuccess) {
            billPayment.setStatus("SUCCESS");
            billPayment.setProviderReference(
                    billProviderService.generateProviderReference()
            );
            billPayment.setReceiptNumber(
                    billProviderService.generateReceiptNumber()
            );
        } else {
            billPayment.setStatus("FAILED");
        }

        BillPayment saved =
                billPaymentRepository.save(billPayment);

        return createReceiptResponse(saved);
    }

    public BillPayment getStatus(Long billPaymentId) {
        return billPaymentRepository.findById(billPaymentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Bill payment not found with ID: "
                                        + billPaymentId
                        )
                );
    }

// developed by anika teja reddy
    public List<BillPayment> getHistory(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        return billPaymentRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public BillReceiptResponse getReceipt(Long billPaymentId) {
        BillPayment billPayment = getStatus(billPaymentId);
        return createReceiptResponse(billPayment);
    }

    private BillReceiptResponse createReceiptResponse(
            BillPayment billPayment
    ) {
        BillReceiptResponse response = new BillReceiptResponse();

        response.setBillPaymentId(billPayment.getId());
        response.setUserId(billPayment.getUserId());
        response.setCategory(billPayment.getCategory());
        response.setBiller(billPayment.getBiller());
        response.setConsumerNumber(
                billPayment.getConsumerNumber()
        );
        response.setAmount(billPayment.getAmount());
        response.setStatus(billPayment.getStatus());
        response.setProviderReference(
                billPayment.getProviderReference()
        );
        response.setReceiptNumber(
                billPayment.getReceiptNumber()
        );
        response.setCreatedAt(billPayment.getCreatedAt());

        return response;
    }

    private void validateFetchRequest(BillFetchRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Bill fetch request is required."
            );
        }

        if (request.getCategory() == null ||
                request.getCategory().isBlank()) {
            throw new IllegalArgumentException(
                    "Bill category is required."
            );
        }

        if (request.getBillerId() == null ||
                request.getBillerId().isBlank()) {
            throw new IllegalArgumentException(
                    "Biller ID is required."
            );
        }

        if (request.getConsumerNumber() == null ||
                request.getConsumerNumber().isBlank()) {
            throw new IllegalArgumentException(
                    "Consumer number is required."
            );
        }
    }

    private void validatePaymentRequest(
            BillPaymentRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Bill payment request is required."
            );
        }

        if (request.getUserId() == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        if (request.getCategory() == null ||
                request.getCategory().isBlank()) {
            throw new IllegalArgumentException(
                    "Bill category is required."
            );
        }

        if (request.getBillerId() == null ||
                request.getBillerId().isBlank()) {
            throw new IllegalArgumentException(
                    "Biller ID is required."
            );
        }

        if (request.getConsumerNumber() == null ||
                request.getConsumerNumber().isBlank()) {
            throw new IllegalArgumentException(
                    "Consumer number is required."
            );
        }

        if (request.getAmount() == null ||
                request.getAmount() <= 0) {
            throw new IllegalArgumentException(
                    "Bill amount must be greater than zero."
            );
        }

        if (request.getBillReference() == null ||
                request.getBillReference().isBlank()) {
            throw new IllegalArgumentException(
                    "Bill reference is required."
            );
        }

        if (request.getPaymentProvider() == null ||
                request.getPaymentProvider().isBlank()) {
            request.setPaymentProvider("MOCK");
        }
    }
}