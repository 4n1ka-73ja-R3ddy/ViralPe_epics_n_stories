package com.viralpe.transaction.controller;

import com.viralpe.transaction.dto.CheckoutConfirmRequest;
import com.viralpe.transaction.dto.CheckoutConfirmResponse;
import com.viralpe.transaction.dto.CheckoutPreviewRequest;
import com.viralpe.transaction.dto.CheckoutPreviewResponse;
import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import com.viralpe.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    public TransactionController(
            TransactionRepository transactionRepository,
            TransactionService transactionService
    ) {
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
    }

    @PostMapping("/checkout/preview")
    public ResponseEntity<CheckoutPreviewResponse> previewCheckout(
            @Valid @RequestBody CheckoutPreviewRequest request
    ) {
        CheckoutPreviewResponse response =
                transactionService.previewCheckout(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/checkout/confirm")
    public ResponseEntity<CheckoutConfirmResponse> confirmCheckout(
            @Valid @RequestBody CheckoutConfirmRequest request
    ) {
        CheckoutConfirmResponse response =
                transactionService.confirmCheckout(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping
// developed by anika teja reddy
    public ResponseEntity<List<Transaction>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime to
    ) {
        List<Transaction> all = transactionRepository.findAll();

        List<Transaction> filtered =
                all.stream()
                        .filter(transaction -> {
                            if (userId != null
                                    && !userId.equals(transaction.getUserId())) {
                                return false;
                            }

                            if (type != null
                                    && !type.equalsIgnoreCase(
                                            transaction.getTransactionType()
                                    )) {
                                return false;
                            }

                            if (status != null
                                    && !status.equalsIgnoreCase(
                                            transaction.getStatus()
                                    )) {
                                return false;
                            }

                            if (from != null
                                    && (transaction.getCreatedAt() == null
                                    || transaction.getCreatedAt().isBefore(from))) {
                                return false;
                            }

                            if (to != null
                                    && (transaction.getCreatedAt() == null
                                    || transaction.getCreatedAt().isAfter(to))) {
                                return false;
                            }

                            return true;
                        })
                        .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }
}