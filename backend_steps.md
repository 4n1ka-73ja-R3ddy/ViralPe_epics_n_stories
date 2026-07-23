Reviewing the existing implementation plan so I can provide the complete ordered backend steps and then continue with frontend completion.

Read [](file:///c%3A/Users/anika_tywp/OneDrive/Desktop/Anika_Teja_Reddy_Work/ViralPe/IMPLEMENTATION_STEPS.md)

## Frontend status

- Frontend skeleton is created in frontend
- It includes React + Vite setup and pages for:
  - `/` welcome
  - `/onboarding`
  - `/dashboard`

## Backend implementation steps

1. Project setup
   - Create Java Spring Boot backend under backend
   - Add `pom.xml` with Spring Boot web, JPA, security, validation, actuator, Flyway, PostgreSQL
   - Add `ViralPeApplication.java`
   - Add `application.yml` with DB and Flyway settings
   - Add README.md

2. Define package structure
   - controller, dto, `auth/service`
   - `user/controller`, dto, model, service
   - controller, dto, model, service
   - controller, dto, model, service
   - integration, service
   - service, model
   - controller, dto, service
   - config
   - exception
   - job
   - repository
   - util

3. Define database entities and repositories
   - Create entities:
     - User
     - `Pincode`
     - `WalletBalance`
     - `ReversalWallet`
     - `LedgerEntry`
     - Transaction
     - `Vendor`
     - `PincodePool`
     - `RoyaltyConfiguration`
     - `AdminAuditLog`
   - Create JPA repositories
   - Add Flyway migrations in `backend/src/main/resources/db/migration/`
   - Model columns and FK constraints from PRD

4. Implement authentication and onboarding
   - Build controller endpoints for Google and Apple sign-in
   - Implement `auth/service` for OAuth, user provisioning, token generation
   - Build `user/controller` onboarding endpoints
   - Implement service for pincode validation, immutable profile fields, referral/onboarding code
   - Add dto classes
   - Add model entities
   - Enforce incomplete-profile access blocking

5. Implement wallet architecture
   - Create spendable wallet and reversal wallet entities
   - Implement service credit/debit logic
   - Create ledger models for:
     - Cashback
     - Referral
     - Vendor Royalty
     - Pincode Royalty
     - Total Earnings
   - Add controller endpoints
   - Ensure immutable, timestamped wallet ledger entries
   - Prevent negative wallet balances

6. Implement zero-load checkout and payment flow
   - Build controller checkout endpoints
   - Add service and integration stubs for UPI/Card/NetBanking
   - Implement balance application order:
     - Reversal Wallet
     - Wallet Balance
     - Payment Gateway delta
   - Support partial wallet usage
   - Create model and dto
   - Handle failures and reversals correctly

7. Implement utility and voucher services
   - Add endpoints/DTOs for:
     - Mobile recharge
<!--  -->
     - Bill payments (BBPS)
     - Voucher/gift card purchase
   - Fetch third-party plans/billers/vouchers
   - Use checkout flow for payment
   - Record status and history
   - Trigger royalty engine on success

8. Implement referral bonus engine
   - Add referral bonus logic in service
   - Compute bonus from profit margin
   - Credit referrer wallet
   - Append referral ledger entry
   - Update total earnings
   - Add referral earnings history API

9. Implement cashback engine
   - Add cashback calculation logic
   - Deduct configured fraction to pincode pool
   - Credit net cashback to wallet
   - Log cashback ledger and total earnings
   - Add cashback history API

10. Implement vendor royalty engine
    - Add vendor royalty logic
    - Deduct configured fraction to vendor pincode pool
    - Credit onboarder wallet
    - Log vendor royalty ledger
    - Add vendor royalty history API

11. Implement pincode royalty championship
    - Create `PincodePool` model
    - Add ticker data to dashboard
    - Accumulate cycle contributions
    - Create scheduled jobs for daily/weekly/monthly evaluation
    - Select winners by highest eligible earner
    - Credit winner wallet, ledger, total earnings, reset pool

12. Implement vertical royalty configuration
    - Add `RoyaltyConfiguration` entity
    - Apply vertical/category royalty before downstream splits
    - Use effective margin for cashback/referral/vendor/pincode
    - Add API to view/update config

13. Implement admin management
    - Add admin endpoints for:
      - fund injection
      - pincode management
      - royalty percentage config
    - Add admin services and audit logs
    - Persist admin actions

14. Implement transaction history and reporting
    - Add transaction history endpoints
    - Filter by date/type/status
    - Add wallet activity log endpoint
    - Clearly mark failed transactions and reversal credits

15. Add configuration and validation
    - Add global config classes
    - Add exception handlers
    - Add DTO validation annotations
    - Add security config and auth enforcement

16. Add database migrations
    - Add Flyway SQL scripts
    - Create schema for all entities
    - Add seed data for admin, royalty config, sample pincodes

17. Test and verify
    - Add backend tests in `backend/src/test/java/com/viralpe/`
    - Cover onboarding, wallet, checkout, royalty engines, admin, jobs
    - Run locally and verify APIs

18. Clean up temporary files
    - Remove tmp_docx_extract
    - Remove tmp_extract.ps1
    - Remove tmp_parse_docx.ps1

19. Optional enhancements
    - Swagger/OpenAPI docs
    - stronger payment gateway adapters
    - multi-tenant/regional support
    - monitoring and health checks

---

If you want, I can now start implementing the backend step-by-step beginning with step 3 (entities + repositories) or step 4 (auth/onboarding).