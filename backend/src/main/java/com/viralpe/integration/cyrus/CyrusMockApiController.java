package com.viralpe.integration.cyrus;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Cyrus Recharge Mock API Server Controller
 * Implements cyrus_recharge_mock_spec.md specification.
 * Simulates PREPAID, POSTPAID, DTH, FASTAG, and UTILITY recharge flows.
 * Includes atomic 2-in-10 failure rule (20% failure simulation) for testing wallet reversal routines.
 */
@RestController
@RequestMapping("/api/cyrus")
public class CyrusMockApiController {

    private final AtomicLong requestCounter = new AtomicLong(0);
    private final AtomicLong successCounter = new AtomicLong(0);
    private final AtomicLong failureCounter = new AtomicLong(0);

    // =========================================================================
    // A. Bill Fetch Endpoint (For Postpaid, FASTag & Utilities)
    // =========================================================================
    @PostMapping("/bill-fetch")
    public ResponseEntity<Map<String, Object>> fetchBill(@RequestBody Map<String, Object> request) {
        String accountId = request.get("account_id") != null ? request.get("account_id").toString() : "1002938481";
        String operatorCode = request.get("operator_code") != null ? request.get("operator_code").toString() : "BESCOM";
        String serviceType = request.get("service_type") != null ? request.get("service_type").toString() : "UTILITY";

        Map<String, Object> data = new HashMap<>();
        data.put("account_id", accountId);
        data.put("customer_name", "John Doe");
        data.put("bill_amount", 1250.00);
        data.put("due_date", LocalDate.now().plusDays(15).toString());
        data.put("bill_number", "BILL_" + Math.abs(accountId.hashCode() % 90000 + 10000));
        data.put("biller_name", resolveBillerName(operatorCode, serviceType));
        data.put("service_type", serviceType);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("response_code", 200);
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // B. Transaction / Recharge Endpoint (Supports POST & GET)
    // =========================================================================
    @PostMapping("/recharge")
    public ResponseEntity<Map<String, Object>> processRechargePost(@RequestBody Map<String, Object> request) {
        return handleRecharge(request);
    }

    @GetMapping("/recharge")
    public ResponseEntity<Map<String, Object>> processRechargeGet(
            @RequestParam(value = "service_type", defaultValue = "PREPAID") String serviceType,
            @RequestParam(value = "account_id", defaultValue = "9876543210") String accountId,
            @RequestParam(value = "operator_code", defaultValue = "JIO") String operatorCode,
            @RequestParam(value = "amount", defaultValue = "299") Double amount,
            @RequestParam(value = "client_order_id", required = false) String clientOrderId
    ) {
        Map<String, Object> req = new HashMap<>();
        req.put("service_type", serviceType);
        req.put("account_id", accountId);
        req.put("operator_code", operatorCode);
        req.put("amount", amount);
        req.put("client_order_id", clientOrderId != null ? clientOrderId : "ORD_" + System.currentTimeMillis());
        return handleRecharge(req);
    }

    private ResponseEntity<Map<String, Object>> handleRecharge(Map<String, Object> request) {
        long currentCount = requestCounter.incrementAndGet();

        String clientOrderId = request.get("client_order_id") != null
                ? request.get("client_order_id").toString()
                : "ORD_" + (10000 + (currentCount % 90000));
        String serviceType = request.get("service_type") != null
                ? request.get("service_type").toString().toUpperCase()
                : "PREPAID";

        Double amount = 299.0;
        if (request.get("amount") != null) {
            try {
                amount = Double.parseDouble(request.get("amount").toString());
            } catch (Exception ignored) {}
        }

        // ---------------------------------------------------------------------
        // Section 4: Deterministic Override Triggers
        // ---------------------------------------------------------------------
        if (amount == 99.0) {
            // Force PENDING (HTTP 201)
            Map<String, Object> data = new HashMap<>();
            data.put("client_order_id", clientOrderId);
            data.put("txnid", "CYRUS_PENDING_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            data.put("service_type", serviceType);
            data.put("amount", amount);
            data.put("status", "PENDING");

            Map<String, Object> resp = new HashMap<>();
            resp.put("status", "PENDING");
            resp.put("response_code", 201);
            resp.put("message", "Transaction is pending operator confirmation");
            resp.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        }

        if (amount == 404.0) {
            // Force FAILURE (HTTP 400) to test wallet refund routines immediately
            failureCounter.incrementAndGet();
            return buildFailureResponse(clientOrderId, serviceType, amount, "ERR_DETERMINISTIC_TEST_FAILURE");
        }

        if (amount == 200.0) {
            // Force SUCCESS (HTTP 200)
            successCounter.incrementAndGet();
            return buildSuccessResponse(clientOrderId, serviceType, amount);
        }

        // ---------------------------------------------------------------------
        // Section 3: Failure & Wallet Reversal Logic (The 2-in-10 Rule)
        // If requestCount % 10 == 3 OR requestCount % 10 == 7 -> Return FAILURE (HTTP 400)
        // ---------------------------------------------------------------------
        long modulo = currentCount % 10;
        if (modulo == 3 || modulo == 7) {
            failureCounter.incrementAndGet();
            return buildFailureResponse(clientOrderId, serviceType, amount, "ERR_OPERATOR_DOWN");
        }

        // 80% Success Rate
        successCounter.incrementAndGet();
        return buildSuccessResponse(clientOrderId, serviceType, amount);
    }

    // =========================================================================
    // C. Status Query Endpoint
    // =========================================================================
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(
            @RequestParam(value = "client_order_id", required = false) String clientOrderId,
            @RequestParam(value = "txnid", required = false) String txnid
    ) {
        String orderId = clientOrderId != null ? clientOrderId : (txnid != null ? txnid : "ORD_10091");
        String txnRef = txnid != null ? txnid : "CYRUS_SUCCESS_" + Math.abs(orderId.hashCode() % 9000 + 1000);

        Map<String, Object> data = new HashMap<>();
        data.put("client_order_id", orderId);
        data.put("txnid", txnRef);
        data.put("status", "SUCCESS");
        data.put("amount", 299);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("response_code", 200);
        response.put("message", "Transaction completed");
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // D. Mock Stats & Control Endpoint for Developers & Tests
    // =========================================================================
    @GetMapping("/cyrus/mock-stats")
    public ResponseEntity<Map<String, Object>> getMockStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRequests", requestCounter.get());
        stats.put("successCount", successCounter.get());
        stats.put("failureCount", failureCounter.get());
        stats.put("currentModulo", requestCounter.get() % 10);
        stats.put("rule2In10Description", "2 out of 10 requests (count % 10 == 3 or 7) fail with HTTP 400 to test wallet reversal.");
        stats.put("overrideTriggers", Map.of(
                "amount=99", "Force PENDING (201)",
                "amount=404", "Force FAILURE (400) -> Triggers Wallet Refund",
                "amount=200", "Force SUCCESS (200)"
        ));
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/cyrus/mock-reset")
    public ResponseEntity<Map<String, Object>> resetMockStats() {
        requestCounter.set(0);
        successCounter.set(0);
        failureCounter.set(0);
        return ResponseEntity.ok(Map.of("message", "Cyrus Recharge Mock stats counter reset to 0."));
    }

    // Helper Response Builders
    private ResponseEntity<Map<String, Object>> buildSuccessResponse(String clientOrderId, String serviceType, Double amount) {
        Map<String, Object> data = new HashMap<>();
        data.put("client_order_id", clientOrderId);
        data.put("txnid", "CYRUS_SUCCESS_" + Math.abs(clientOrderId.hashCode() % 90000 + 10000));
        data.put("operator_ref", "REF" + (8800000 + System.currentTimeMillis() % 100000));
        data.put("service_type", serviceType);
        data.put("amount", amount);
        data.put("remaining_balance", 15200.00);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("response_code", 200);
        response.put("message", "Transaction Processed Successfully");
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> buildFailureResponse(String clientOrderId, String serviceType, Double amount, String errorCode) {
        Map<String, Object> data = new HashMap<>();
        data.put("client_order_id", clientOrderId);
        data.put("txnid", "CYRUS_FAIL_" + Math.abs(clientOrderId.hashCode() % 90000 + 10000));
        data.put("service_type", serviceType);
        data.put("amount", amount);
        data.put("error_code", errorCode);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "FAILURE");
        response.put("response_code", 400);
        response.put("message", "Operator Connection Timed Out");
        response.put("data", data);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    private String resolveBillerName(String operatorCode, String serviceType) {
        if ("BESCOM".equalsIgnoreCase(operatorCode)) return "Bangalore Electricity Supply Co (BESCOM)";
        if ("FASTAG".equalsIgnoreCase(serviceType)) return "NHAI FASTag National Toll";
        if ("DTH".equalsIgnoreCase(serviceType)) return "Tata Play DTH Satellite";
        return "State Electricity & Utility Board (" + operatorCode + ")";
    }
}
