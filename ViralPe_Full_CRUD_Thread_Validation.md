# ViralPe — Full CRUD & End-to-End Lifecycle Thread Validation Report

**Document Purpose**: Validates complete End-to-End Full Lifecycle CRUD Threads (Create, Read, Update, Delete / Insert, Modify, Delete, Reversal) across all core backend domain engines.

**Data Model**: In-Memory Data Model (`jdbc:h2:mem:viralpedb`)  
**Date**: 2026-07-28  

---

## Executive Summary

This document presents full-lifecycle CRUD thread validations covering **Create/Insert**, **Read/Lookup**, **Update/Modify**, and **Delete/Reset/Sweep/Deactivate** operations across all core business modules in ViralPe.

---

# Thread 1: User Onboarding & Profile Lifecycle Thread

```
[1. OAuth Sign-In (CREATE)] ──> [2. Pincode Validation (READ)] ──> [3. Complete Profile (UPDATE)] ──> [4. Fetch Profile (READ)]
```

### Step 1: Create / Insert User Account
- **Action**: User authenticates via Google or Apple OAuth2.
- **Endpoint**: `POST /api/auth/sign-in/google` or `POST /api/auth/sign-in/apple`
- **Request**:
  ```json
  { "idToken": "eyJhbGciOiJSUzI1NiIs..." }
  ```
- **Result / State Output**: `200 OK`. New User record created with `profileComplete: false`.
  ```json
  { "userId": 105, "token": "uuid-token-105", "profileComplete": false }
  ```

---

### Step 2: Read / Validate Residential Pincode
- **Action**: User enters a 6-digit residential pincode during onboarding.
- **Endpoint**: `POST /api/user/validate-pincode`
- **Request**:
  ```json
  { "pincode": "560001" }
  ```
- **Result / State Output**: `200 OK`. Returns city, district, and state.
  ```json
  { "pincode": "560001", "city": "Bengaluru", "district": "Bengaluru Urban", "state": "Karnataka", "valid": true }
  ```

---

### Step 3: Update / Complete Profile & Lock Geographic Linkage
- **Action**: User confirms location and optionally enters a referral or vendor onboarding code.
- **Endpoint**: `POST /api/user/complete-profile`
- **Request**:
  ```json
  { "userId": 105, "pincode": "560001", "locationConfirmed": true, "referralCode": "VIRAL1" }
  ```
- **Result / State Output**: `200 OK`. Sets `registeredPincode = "560001"`, `referred_by_user_id = 1`, and `profileComplete = true`. Pincode is permanently locked (immutable).

---

### Step 4: Read / Access Profile & Guard Verification
- **Action**: App retrieves user profile.
- **Endpoint**: `GET /api/user/profile?userId=105`
- **Result / State Output**: `200 OK`. Returns completed user profile object.

---

# Thread 2: Multi-Ledger Wallet Lifecycle Thread

```
[1. Auto-Initialize (CREATE)] ──> [2. Credit Wallet (INSERT/MODIFY)] ──> [3. Debit Wallet (UPDATE)] ──> [4. Reversal Credit (INSERT)] ──> [5. Midnight EOD Sweep (DELETE/RESET)]
```

### Step 1: Create / Auto-Initialize Wallet
- **Action**: User signs up; system initializes spendable wallet & reversal wallet balances.
- **Endpoint**: `GET /api/wallet/summary/105`
- **Result / State Output**: `200 OK`. Balances initialized to `spendableBalance: 0.0`, `reversalBalance: 0.0`.

---

### Step 2: Insert / Credit Spendable Wallet Balance
- **Action**: User earns cashback, referral bonus, pincode prize, or admin credits promotional funds.
- **Endpoint**: `POST /api/wallet/credit`
- **Request**:
  ```json
  { "userId": 105, "amount": 1000.0, "category": "PROMOTIONAL_ADD_ON", "sourceReference": "Welcome Bonus" }
  ```
- **Result / State Output**: `200 OK`. Wallet balance updated from ₹0.0 -> ₹1000.0. Audit log entry appended to `LedgerEntryRepository`.

---

### Step 3: Update / Debit Spendable Wallet at Checkout
- **Action**: User applies wallet balance during service checkout.
- **Endpoint**: `POST /api/wallet/debit`
- **Request**:
  ```json
  { "userId": 105, "amount": 400.0, "category": "CHECKOUT", "sourceReference": "Checkout Debit - Zomato Pay" }
  ```
- **Result / State Output**: `200 OK`. Spendable wallet balance updated from ₹1000.0 -> ₹600.0. Running balance recorded in activity log.

---

### Step 4: Insert / Reversal Wallet Credit on Third-Party Failure
- **Action**: A third-party utility transaction fails post-payment gateway debit.
- **Endpoint**: `POST /api/wallet/credit-reversal`
- **Request**:
  ```json
  { "userId": 105, "amount": 500.0, "transactionReference": "TX-FAILED-505" }
  ```
- **Result / State Output**: `200 OK`. Reversal Wallet credited instantly with ₹500.0 (`expiresAt: "23:59:59 Today"`).

---

### Step 5: Delete / Midnight Automated Reversal Sweep
- **Action**: Midnight cron job (`@Scheduled(cron = "0 0 0 * * *")`) executes at 00:00:00 server time.
- **Endpoint**: `POST /api/wallet/sweep-reversal`
- **Result / State Output**: `200 OK`. All unclaimed reversal balances are processed via Refund-to-Source API and Reversal Wallet balance is reset to ₹0.0.

---

# Thread 3: Utility Service Transaction & Priority Checkout Thread

```
[1. MNP Lookup (READ)] ──> [2. Plan Catalog (READ)] ──> [3. Execute Checkout (CREATE/INSERT)] ──> [4. Transaction History (READ)]
```

### Step 1: Read / MNP Operator Lookup
- **Action**: User enters a 10-digit prepaid mobile number.
- **Endpoint**: `GET /api/recharge/mnp?mobileNumber=9876543210`
- **Result / State Output**: `200 OK`. Returns `{ "operator": "Airtel", "circle": "Karnataka", "operatorCode": "1", "circleCode": "12" }`.

---

### Step 2: Read / Fetch Cyrus API Plan Catalog
- **Action**: Retrieves available recharge plans.
- **Endpoint**: `GET /api/recharge/plans?operatorCode=1&circleCode=12&mobileNumber=9876543210`
- **Result / State Output**: `200 OK`. Returns categorized plans catalog.

---

### Step 3: Create / Execute Priority Checkout & Recharge
- **Action**: User confirms plan selection (₹299.0) and executes checkout via priority payment ladder.
- **Endpoint**: `POST /api/checkout`
- **Request**:
  ```json
  {
    "userId": 105,
    "serviceType": "RECHARGE",
    "invoiceAmount": 299.0,
    "applyWallet": true,
    "requestedWalletAmount": 100.0,
    "paymentGatewayMode": "UPI"
  }
  ```
- **Result / State Output**: `200 OK`.
  - Reversal Wallet applied: ₹0.0
  - Wallet Balance debited: ₹100.0
  - Payment Gateway charged: ₹199.0
  - Royalty Engine triggered: Raw cashback calculated, pincode fraction deducted to pool, net cashback credited to wallet.

---

### Step 4: Read / Inspect Transaction History
- **Action**: User views transaction history and payment breakdown.
- **Endpoint**: `GET /api/transactions?userId=105`
- **Result / State Output**: `200 OK`. Lists transaction record with full payment breakdown.

---

# Thread 4: Pincode Royalty Championship Lifecycle Thread

```
[1. Contribution Accumulation (INSERT)] ──> [2. Read Ticker (READ)] ──> [3. Championship Evaluation (MODIFY/RESET)] ──> [4. Admin Phase Update (UPDATE)]
```

### Step 1: Insert / Atomic Pool Contribution Accumulation
- **Action**: Cashback & vendor royalty calculations deduct pincode fractions on every transaction.
- **Internal Action**: `PincodePoolContributionRepository.save(...)`
- **Result / State Output**: Fraction added atomically to `current_cycle_pool` for pincode `560001`.

---

### Step 2: Read / Live Pincode Ticker Lookup
- **Action**: Dashboard fetches current cycle pool total & countdown.
- **Endpoint**: `GET /api/royalty/pincode/ticker?userId=105`
- **Result / State Output**: `200 OK`.
  ```json
  {
    "pincode": "560001",
    "currentCyclePool": 12500.0,
    "activePhase": "DAILY",
    "countdownSeconds": 43200
  }
  ```

---

### Step 3: Modify & Delete / Championship Evaluation & Pool Reset
- **Action**: Daily cron job executes at 23:59:59 server time.
- **Endpoint**: `POST /api/royalty/pincode/evaluate`
- **Result / State Output**: `200 OK`.
  - Highest transactional earner in pincode `560001` identified.
  - Winner receives ₹12,500.0 credited to Wallet Balance & Pincode Royalty Ledger.
  - `current_cycle_pool` reset to ₹0.0 for next cycle.

---

### Step 4: Update / Admin Championship Phase Change
- **Action**: Admin updates global active phase from `DAILY` to `WEEKLY`.
- **Endpoint**: `POST /api/admin/championship/phase`
- **Request**:
  ```json
  { "activePhase": "WEEKLY" }
  ```
- **Result / State Output**: `200 OK`. Active phase updated to `WEEKLY` for subsequent cycle evaluations.

---

# Thread 5: Admin Pincode & Fund Management Thread

```
[1. Add Pincode (INSERT)] ──> [2. Modify Pincode (UPDATE)] ──> [3. Deactivate Pincode (DELETE/DISABLE)] ──> [4. Inject Funds (INSERT/MODIFY)] ──> [5. Audit Trail (READ)]
```

### Step 1: Insert / Add New Postal Pincode
- **Action**: Admin adds a new postal pincode to master directory.
- **Endpoint**: `POST /api/admin/pincode`
- **Request**:
  ```json
  { "pincode": "560002", "city": "Bengaluru", "district": "Bengaluru Urban", "state": "Karnataka", "active": true }
  ```
- **Result / State Output**: `200 OK`. New pincode saved to `PincodeRepository`.

---

### Step 2: Update / Modify Pincode Mappings
- **Action**: Admin updates city/district details.
- **Endpoint**: `POST /api/admin/pincode`
- **Result / State Output**: `200 OK`. Updated pincode details saved.

---

### Step 3: Delete / Deactivate Pincode
- **Action**: Admin deactivates postal pincode.
- **Endpoint**: `PATCH /api/admin/pincode/560002?active=false`
- **Result / State Output**: `200 OK`. Pincode marked `active = false` (disabled for user onboarding).

---

### Step 4: Insert / Modify — Promotional Fund Injection
- **Action**: Admin injects promotional funds into a user's wallet with mandatory reason.
- **Endpoint**: `POST /api/admin/fund-user`
- **Request**:
  ```json
  { "targetUserId": 105, "amount": 1000.0, "reason": "Campaign Winner Reward" }
  ```
- **Result / State Output**: `200 OK`. Wallet balance increased by ₹1000.0. Record saved in `AdminAuditLogRepository`.

---

### Step 5: Read / Inspect Admin Audit Log Trail
- **Action**: Admin retrieves audit logs.
- **Endpoint**: `GET /api/admin/audit-logs`
- **Result / State Output**: `200 OK`. Returns list of all administrative actions with timestamps & notes.

---

## Full CRUD Validation Matrix Summary

| Thread Domain | Create / Insert | Read / Lookup | Update / Modify | Delete / Reset / Deactivate |
| :--- | :---: | :---: | :---: | :---: |
| **User Onboarding** | OAuth Sign-In | Pincode Lookup | Profile Completion | — (Immutable) |
| **Multi-Ledger Wallet** | Auto-Init | Balance Summary | Credit / Debit | Midnight Sweep Reset |
| **Utility & Checkout** | Priority Checkout | MNP & Plan Catalog | — | Reversal Credit on Failure |
| **Pincode Championship** | Pool Contribution | Live Ticker | Admin Phase Switch | Championship Evaluation Reset |
| **Admin Management** | Add Pincode / Fund User | Audit Trail | Update Pincode | Deactivate Pincode |
