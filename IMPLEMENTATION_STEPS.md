# ViralPe Java Backend Implementation Plan

This document describes the step-by-step implementation plan for the ViralPe application using the provided architecture and requirements.

## 1. Project setup

1. Create the Java Spring Boot backend project under `backend/`.
2. Add `pom.xml` with Spring Boot starters for web, data JPA, security, validation, actuator, Flyway, and PostgreSQL.
3. Add `backend/src/main/java/com/viralpe/ViralPeApplication.java` as the entry point.
4. Add `backend/src/main/resources/application.yml` with local database configuration and Flyway settings.
5. Add `backend/README.md` describing the module structure.

## 2. Define package structure

Create these top-level Java packages under `backend/src/main/java/com/viralpe/`:

- `auth`
  - `controller`
  - `dto`
  - `service`
- `user`
  - `controller`
  - `dto`
  - `model`
  - `service`
- `wallet`
  - `controller`
  - `dto`
  - `model`
  - `service`
- `transaction`
  - `controller`
  - `dto`
  - `model`
  - `service`
- `payment`
  - `integration`
  - `service`
- `royalty`
  - `service`
  - `model`
- `admin`
  - `controller`
  - `dto`
  - `service`
- `config`
- `exception`
- `job`
- `repository`
- `util`

## 3. Define database entities and repositories

1. Create entity classes for core tables:
   - `User`
   - `Pincode`
   - `WalletBalance`
   - `ReversalWallet`
   - `LedgerEntry`
   - `Transaction`
   - `Vendor`
   - `PincodePool`
   - `RoyaltyConfiguration`
   - `AdminAuditLog`
2. Create JPA repositories under `repository/` for each entity.
3. Create Flyway migration scripts in `backend/src/main/resources/db/migration/` to define schema.
4. Use the PRD data model hints for table columns and foreign keys.

## 4. Implement authentication and onboarding

1. Build `auth/controller` endpoints for Google Sign-In and Apple Sign-In.
2. Implement `auth/service` to handle OAuth response, user provisioning, and token generation.
3. Build `user/controller` endpoints for profile completion.
4. Implement `user/service` to validate pincodes, lock profile fields, and store referral/onboarding codes.
5. Add `user/dto` classes for sign-in requests, onboarding requests, and profile responses.
6. Add `user/model` entities for `User`, `Vendor`, and onboarding metadata.
7. Enforce access control so incomplete-profile users cannot access dashboard or transaction endpoints.

## 5. Implement wallet architecture

1. Create `wallet/model` entities for spendable wallet balance and reversal wallet.
2. Add `wallet/service` logic for crediting and debiting the wallet.
3. Create ledger models for read-only trackers:
   - Cashback Ledger
   - Referral Ledger
   - Vendor Royalty Ledger
   - Pincode Royalty Ledger
   - Total Earnings Ledger
4. Add `wallet/controller` endpoints to expose wallet balances and ledger summaries.
5. Ensure wallet credits and debits are immutable, timestamped, and source-referenced.
6. Enforce `Wallet Balance cannot go negative` rule in service methods.

## 6. Implement zero-load checkout and payment flow

1. Build `transaction/controller` checkout endpoints.
2. Implement `payment/service` and `payment/integration` stubs for payment gateway, UPI, card, and net banking.
3. Create checkout logic that applies balances in this order:
   - Reversal Wallet
   - Wallet Balance
   - Payment Gateway delta
4. Add support for partial wallet usage selection.
5. Create `transaction/model` and `transaction/dto` classes to store transaction details and payment breakdown.
6. Implement failure handling:
   - If PG fails, do not debit wallet
   - If partial wallet debited and PG fails, reverse wallet debit
   - If third-party transaction fails after payment, credit Reversal Wallet

## 7. Implement utility and voucher services

1. Create endpoints and DTOs for:
   - Mobile recharge
   - Bill payments (BBPS)
   - Digital voucher/gift card purchases
2. Implement service flows that:
<!--  -->
   - Fetch available plans/billers/vouchers from third-party APIs
   - Perform checkout via the zero-load payment flow
   - Record transaction status and history
3. Ensure success triggers the royalty engine and failure returns correct status.

## 8. Implement referral bonus engine

1. Add referral bonus calculation logic in `royalty/service`.
2. When a referred user transacts successfully:
   - Compute bonus from profit margin
   - Credit referrer Wallet Balance
   - Append entry to Referral Ledger
   - Update Total Earnings Ledger
3. Create referral earnings history endpoint in `wallet/controller` or `transaction/controller`.

## 9. Implement cashback engine

1. Add cashback calculation and credit logic in `royalty/service`.
2. Deduct a configurable fraction to the Pincode Royalty Pool.
3. Credit net cashback to the user's Wallet Balance.
4. Log the amount in the Cashback Ledger and Total Earnings Ledger.
5. Add cashback history API.

## 10. Implement vendor royalty engine

1. Add vendor royalty calculation logic in `royalty/service`.
2. Deduct a configurable fraction to the vendor business pincode pool.
3. Credit the onboarder’s Wallet Balance.
4. Log vendor royalty entries.
5. Add vendor royalty history API.

## 11. Implement pincode royalty championship

1. Create `royalty/model/PincodePool` to track:
   - current cycle pool
   - active phase
   - last winner
   - last payout
2. Add real-time ticker data to user dashboard responses.
3. Add cycle contribution methods to accumulate cashback/vendor deductions.
4. Create scheduled jobs in `job/` for:
   - daily evaluation at 23:59:59
   - weekly evaluation on Sunday 23:59:59
   - monthly evaluation on last day of month 23:59:59
5. Implement winner selection logic based on highest eligible user earnings in the pincode.
6. On payout:
   - credit winner Wallet Balance
   - update Pincode Royalty Ledger
   - update Total Earnings Ledger
   - reset cycle pool to ₹0

## 12. Implement vertical royalty configuration

1. Add `RoyaltyConfiguration` entity and admin config tables.
2. Apply vertical/category-level royalty percentages before downstream splits.
3. Ensure the base margin after vertical royalty is used for cashback, referral, vendor, and pincode calculations.
4. Add API to view and update vertical royalty settings.

## 13. Implement admin management

1. Add `admin/controller` endpoints for:
   - fund injection
   - pincode directory management
   - royalty percentage configuration
2. Create admin service methods to:
   - credit user Wallet Balance with audit reason
   - add/update/deactivate pincodes
   - manage cashback/referral/vendor/pincode split percentages
3. Store audit history for all admin changes.

## 14. Implement transaction history and reporting

1. Add transaction history endpoints to `transaction/controller`.
2. Include filters for date range, type, and status.
3. Add wallet activity log endpoint showing all credits and debits with running balance.
4. Mark failed transactions clearly and show Reversal Wallet credits.

## 15. Add configuration and validation

1. Add global configuration classes in `config/`.
2. Add custom exceptions and handlers in `exception/`.
3. Add validation annotations for DTOs.
4. Add security configuration to enforce authentication and authorization.

## 16. Add database migrations

1. Add Flyway SQL migration scripts in `backend/src/main/resources/db/migration/`.
2. Create schema for all core entities and reference constraints.
3. Add seed data for admin, royalty configuration, and sample pincodes.

## 17. Test and verify

1. Add tests in `backend/src/test/java/com/viralpe/`.
2. Cover:
   - authentication and onboarding flows
   - wallet and checkout logic
   - referral, cashback, vendor, and pincode royalty calculation
   - admin configurations
   - scheduled job execution
3. Run application locally and verify API flows.

## 18. Clean up temporary files

1. Remove any temporary extraction files created during analysis:
   - `tmp_docx_extract/`
   - `tmp_extract.ps1`
   - `tmp_parse_docx.ps1`
2. Keep only the application source and documents required for development.

## 19. Optional future enhancements

1. Add API documentation via Swagger/OpenAPI.
2. Add more robust payment gateway adapter support.
3. Add multi-tenant or regional configuration support.
4. Add monitoring/health checks and alerting.
