package com.viralpe.transaction.controller;

import com.viralpe.transaction.model.Transaction;
import com.viralpe.transaction.repository.TransactionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
    ) {
        List<Transaction> all = transactionRepository.findAll();
        List<Transaction> filtered = all.stream().filter(t -> {
            if (userId != null && !userId.equals(t.getUserId())) return false;
            if (type != null && !type.equalsIgnoreCase(t.getTransactionType())) return false;
            if (status != null && !status.equalsIgnoreCase(t.getStatus())) return false;
            if (from != null && (t.getCreatedAt() == null || t.getCreatedAt().isBefore(from))) return false;
            if (to != null && (t.getCreatedAt() == null || t.getCreatedAt().isAfter(to))) return false;
            return true;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }
}
