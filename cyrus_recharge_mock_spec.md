# Cyrus Recharge Mock API Server Specification

## Overview
This document outlines the implementation requirements for building a lightweight mock API server simulating the **Cyrus Recharge Multi-Service API**. This mock server will be used across our backend microservices (.NET, Java, Python) to test:
- Service category integrations
- Asynchronous status checks and bill fetching
- **Wallet refund and reversal workflows** (via deterministic 20% failure simulation)

---

## 1. Supported Service Categories (`service_type`)

| Service Type | Key Parameters Required | Description |
| :--- | :--- | :--- |
| `PREPAID` | `account_id` (Mobile No), `operator_code`, `amount` | Mobile prepaid top-ups |
| `POSTPAID` | `account_id` (Mobile No), `operator_code`, `amount` | Mobile postpaid bill payments |
| `DTH` | `account_id` (Subscriber ID), `operator_code`, `amount` | Direct-To-Home satellite TV |
| `FASTAG` | `account_id` (Vehicle No), `operator_code`, `amount` | Vehicle toll recharges |
| `UTILITY` | `account_id` (CA / Consumer No), `operator_code`, `amount` | Electricity, Water, Gas, Landline (BBPS) |

---

## 2. API Endpoints Specification

### A. Bill Fetch Endpoint (For Postpaid, FASTag & Utilities)
* **Endpoint:** `POST /api/bill-fetch`
* **Description:** Simulates retrieving bill details before payment execution.

#### Request Body:
```json
{
  "member_id": "MEM123",
  "api_key": "secret_key",
  "service_type": "UTILITY",
  "account_id": "1002938481",
  "operator_code": "BESCOM"
}
```

#### Response Body (`200 OK`):
```json
{
  "status": "SUCCESS",
  "response_code": 200,
  "data": {
    "account_id": "1002938481",
    "customer_name": "John Doe",
    "bill_amount": 1250.00,
    "due_date": "2026-08-15",
    "bill_number": "BILL_88392",
    "biller_name": "State Electricity Board"
  }
}
```

---

### B. Transaction / Recharge Endpoint
* **Endpoint:** `POST /api/recharge` (or `GET /api/recharge` via query parameters)
* **Description:** Processes the payment or recharge operation across all service types.

#### Request Body:
```json
{
  "member_id": "MEM123",
  "api_key": "secret_key",
  "service_type": "PREPAID",
  "account_id": "9876543210",
  "operator_code": "JIO",
  "amount": 299,
  "client_order_id": "ORD_10091"
}
```

---

### C. Status Query Endpoint
* **Endpoint:** `GET /api/status`
* **Query Parameters:** `client_order_id` or `txnid`

#### Response Body (`200 OK`):
```json
{
  "status": "SUCCESS",
  "response_code": 200,
  "message": "Transaction completed",
  "data": {
    "client_order_id": "ORD_10091",
    "txnid": "CYRUS_SUCCESS_9918",
    "status": "SUCCESS",
    "amount": 299
  }
}
```

---

## 3. Failure & Wallet Reversal Logic (The 2-in-10 Rule)

To validate our **wallet refund and reversal engine**, implement an atomic global request counter (`requestCount`) on the `/api/recharge` route.

### Rule Logic
* **20% Failure Rate (2 out of 10 requests):**
  * If `requestCount % 10 == 3` OR `requestCount % 10 == 7` $ightarrow$ Return **`FAILURE`** (`HTTP 400`).
* **80% Success Rate (8 out of 10 requests):**
  * All other requests $ightarrow$ Return **`SUCCESS`** (`HTTP 200`).

#### Success Response (`HTTP 200`):
```json
{
  "status": "SUCCESS",
  "response_code": 200,
  "message": "Transaction Processed Successfully",
  "data": {
    "client_order_id": "ORD_10091",
    "txnid": "CYRUS_SUCCESS_9918",
    "operator_ref": "REF8830192",
    "service_type": "PREPAID",
    "amount": 299,
    "remaining_balance": 15200.00
  }
}
```

#### Failure Response (`HTTP 400` - Triggers Wallet Reversal):
```json
{
  "status": "FAILURE",
  "response_code": 400,
  "message": "Operator Connection Timed Out",
  "data": {
    "client_order_id": "ORD_10091",
    "txnid": "CYRUS_FAIL_9918",
    "service_type": "UTILITY",
    "amount": 299,
    "error_code": "ERR_OPERATOR_DOWN"
  }
}
```

---

## 4. Deterministic Override Triggers

To allow deterministic unit and automated testing without relying on the counter modulo logic, developers can pass specific values in the `amount` field to force a fixed response:

* `amount == 99`: Force **`PENDING`** status (`HTTP 201`).
* `amount == 404`: Force **`FAILURE`** status (`HTTP 400`) to test wallet refund routines immediately.
* `amount == 200`: Force **`SUCCESS`** status (`HTTP 200`).

---

## 5. Deployment Requirement
Deliver this mock server as a standalone application or containerized image (`Dockerfile`) so developers across .NET, Java, and Python teams can run it locally or inside CI/CD test pipelines.
