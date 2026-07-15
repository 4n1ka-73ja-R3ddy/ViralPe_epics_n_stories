# ViralPe Project Summary

## 0. Latest updates (2026-07-15)

This section tracks the newest implemented changes with direct file references and live URLs.

### 0.1 Live runtime URLs

- Frontend dev server: http://localhost:3002/
- Backend base URL: http://localhost:8081/
- Scalar docs: http://localhost:8081/scalar
- OpenAPI JSON: http://localhost:8081/v3/api-docs

### 0.2 New Google Sign-In implementation (fixed end-to-end)

Backend changes:

- backend/src/main/java/com/viralpe/auth/dto/GoogleSignInRequest.java
  - New request DTO for ID token payload (`idToken` required).
- backend/src/main/java/com/viralpe/auth/dto/DemoSignInRequest.java
  - New request DTO for demo auth mode with `userType` (`NEW` or `RETURNING`).
  - Supports provider hint (`GOOGLE` / `APPLE`) for provider-specific demo sign-in paths.
- backend/src/main/java/com/viralpe/auth/controller/AuthController.java
  - `/api/auth/sign-in/google` now accepts `GoogleSignInRequest` and calls verified Google flow.
  - Added `/api/auth/sign-in/demo` for sample demo auth testing.
- backend/src/main/java/com/viralpe/auth/service/AuthService.java
  - Added Google token verification via `https://oauth2.googleapis.com/tokeninfo?id_token=...`.
  - Enforces email verification and optional audience/client-id check.
  - Links returning users by email and updates provider/providerId to keep Google identity mapping correct.
  - Added explicit demo user logic:
    - `NEW` -> profile incomplete (mandatory onboarding path)
    - `RETURNING` -> profile complete (direct dashboard path)
  - Added provider-specific demo identities for both Google and Apple options.
- backend/src/main/java/com/viralpe/user/controller/UserController.java
  - Added `GET /api/user/pincode/{pincode}` for pincode validation and location lookup.
  - `POST /api/user/complete-profile` now returns structured response with optional warning.
- backend/src/main/java/com/viralpe/user/service/UserService.java
  - Story 1.3 implementation:
    - validates 6-digit pincode against master table
    - returns city/district/state for confirmation
    - enforces confirmation before completion
    - keeps pincode immutable after completion
  - Story 1.4 implementation:
    - optional referral/onboarding code
    - valid numeric referral links `referred_by_user_id`
    - valid vendor code links `onboarded_by_user_id`
    - invalid code does not block onboarding (returns warning)
- backend/src/main/java/com/viralpe/user/dto/PincodeValidationResponse.java
  - New pincode lookup response DTO.
- backend/src/main/java/com/viralpe/user/dto/ProfileCompletionResponse.java
  - New completion response DTO with message + warning.
- backend/src/main/java/com/viralpe/config/WebSecurityConfig.java
  - Added CORS support with configurable frontend origin.
- backend/src/main/java/com/viralpe/config/RestExceptionHandler.java
  - Added explicit 400 handling for `IllegalArgumentException` with meaningful error JSON.
- backend/src/main/resources/application.yml
  - Added properties:
    - `viralpe.frontend.url` (from `VIRALPE_FRONTEND_URL`, default `http://localhost:3000`)
    - `viralpe.auth.google.client-id` (from `GOOGLE_CLIENT_ID`)

Frontend changes:

- frontend/package.json
  - Added `@react-oauth/google`.
  - Removed incompatible `@types/react-router-dom` v5 typings.
- frontend/src/main.tsx
  - Wrapped app with optional `GoogleOAuthProvider` only when `VITE_GOOGLE_CLIENT_ID` is configured.
  - Fixes blank screen crash when Google client id is not present in local env.
- frontend/src/lib/api.ts
  - Added API client for auth/profile/wallet endpoints.
  - Added demo sign-in API call for new-vs-returning test path.
  - Added pincode validation API and structured profile completion response types.
- frontend/src/lib/session.ts
  - Added local session persistence for userId/token/profile completion.
- frontend/src/App.tsx
  - Added route guards for signed-in and profile-complete states.
- frontend/src/pages/HomePage.tsx
  - Replaced placeholder buttons with real Google OAuth login flow and demo auth controls.
  - Added Google Sign-In and Apple Sign-In provider selector.
  - Added New User vs Returning User mode selector.
  - Returning user mode skips onboarding; new user mode enforces mandatory profile completion.
  - Google SDK now uses explicit account chooser flow on click (no one-tap auto sign-in).
  - If provider credentials are missing locally, provider-specific demo sign-in remains available.
  - Added professional hero/auth panel and failure-state messaging.
- frontend/src/pages/OnboardingPage.tsx
  - Wired to `/api/user/complete-profile` and session update logic.
  - Added one-click sample-value autofill (`560001`, `101`) for demo testing.
  - Added live pincode validation and City/District/State confirmation before submission.
- frontend/src/pages/DashboardPage.tsx
  - Wired to live backend APIs:
    - `/api/user/profile/{userId}`
    - `/api/wallet/balance/{userId}`
    - `/api/wallet/reversal/{userId}`
    - `/api/wallet/ledger/{userId}`
  - Added logout and responsive data cards/table.
- frontend/src/index.css
  - Full professional redesign with responsive layout, custom typography, gradients, glass surfaces, and purposeful motion.
  - Added professional controls for provider/user-type chips and pincode validation confirmation card.
- frontend/src/vite-env.d.ts
  - Added Vite type reference.
- frontend/.env.example
  - Added setup template for:
    - `VITE_GOOGLE_CLIENT_ID`
    - `VITE_API_BASE_URL`
    - `VITE_BACKEND_TARGET`

### 0.3 Runtime validation evidence

- Backend compile: success (`mvn -DskipTests compile`).
- Frontend build: success (`npm run build`).
- Google endpoint validation examples on backend:
  - empty token -> `400 {"idToken":"must not be blank"}`
  - invalid token -> `400 {"error":"Google sign-in failed. Please try again."}`

### 0.4 Current dev server notes

- Frontend ports 3000 and 3001 were occupied, so Vite auto-switched to port 3002.
- If backend runs on port 8081, set frontend proxy target using:
  - `VITE_BACKEND_TARGET=http://localhost:8081`
- Current blank-screen issue root cause and fix:
  - Cause: app was throwing on startup when `VITE_GOOGLE_CLIENT_ID` was missing.
  - Fix: app now renders with demo auth path even without Google local env.
- Request-failed issue fix:
  - Vite proxy default target updated to `http://localhost:8081` to match backend runtime.

## 1. What this repository is

This repository contains the ViralPe application work-in-progress with:

- A Java Spring Boot backend in backend/
- A React + TypeScript frontend in frontend/
- Product and planning documents at the repository root
- Supporting temporary scripts and modernization artifacts

The project follows a fintech model where users complete onboarding, perform utility checkout flows, and receive wallet credits and royalty-based incentives.

## 2. Current implementation status at a glance

- Backend framework and data model are implemented as a functional skeleton with key APIs.
- Core wallet operations, checkout flow, cashback, referral bonus, and admin fund/pincode APIs exist.
- Some modules are placeholders (for example TransactionService and RoyaltyService status methods).
- Security is currently open (all requests are permitted in WebSecurityConfig).
- Frontend has been upgraded to a professional multi-screen UI with live API wiring for sign-in, onboarding, and dashboard data.
- Database migrations are present and seed default royalty configuration and sample pincodes.

## 3. Repository layout and purpose of each major area

### 3.1 Root-level documents and utilities

- ARCHITECTURE.md
  - Earlier architecture write-up (currently mismatched in parts with actual code; mentions .NET while backend code is Java).
- requirements.md
  - Main PRD and business behavior blueprint (wallet model, checkout order, royalty engine, pincode championship rules).
- IMPLEMENTATION_STEPS.md
  - Planned step-by-step implementation roadmap mapped to epics and modules.
- backend_steps.md
  - Backend planning notes.
- Epics_And_Stories.docx
  - Source product planning document.
- Epics_And_Stories.txt and Epics_And_Stories_paragraphs.txt
  - Extracted text/paragraph versions of product planning content.
- tmp_extract.ps1 and tmp_parse_docx.ps1
  - Temporary extraction scripts used during document processing.

### 3.2 Backend project folder

Path: backend/

Contains the Java service implementation, configuration, migrations, and tests.

Key project files:

- backend/pom.xml
  - Maven build definition.
  - Spring Boot 3.2.2 parent.
  - Java 21.
  - Includes starters for web, data-jpa, security, validation, actuator, flyway, postgres, test.
- backend/README.md
  - High-level module structure and epic mapping guidance.
- backend/src/main/resources/application.yml
  - Runs on port 8080.
  - PostgreSQL datasource configuration.
  - Flyway migration enabled.
- backend/src/main/resources/application.properties
  - Allows bean definition overriding.

### 3.3 Frontend project folder

Path: frontend/

Contains React Vite app used as the UI prototype.

Key files:

- frontend/package.json
  - React 18, React Router DOM, Vite, TypeScript.
  - Scripts: dev, build, preview.
- frontend/vite.config.ts
  - Dev server port 3000.
  - API proxy from /api to http://localhost:8080.
- frontend/src/App.tsx
  - Route map for /, /onboarding, /dashboard.
- frontend/src/pages/HomePage.tsx
  - Social sign-in entry UI.
- frontend/src/pages/OnboardingPage.tsx
  - Pincode and optional referral/onboarding code form.
- frontend/src/pages/DashboardPage.tsx
  - Wallet/reversal/ledger placeholders.
- frontend/src/index.css
  - Basic global styling.

### 3.4 Additional top-level module folders

There are scaffold folders at repository root such as admin/, auth/, transaction/, user/, wallet/, payment/, royalty/ and others.

These currently appear to be placeholder directory skeletons and do not contain the active backend source implementation. Active backend source lives under backend/src/main/java/com/viralpe/.

## 4. Backend architecture details

## 4.1 Entry point and application bootstrapping

- backend/src/main/java/com/viralpe/ViralPeApplication.java
  - Main Spring Boot application class.
  - Enables JPA repositories and entity scan under com.viralpe.

## 4.2 Backend package-by-package purpose

- admin
  - Admin APIs and audit logging.
- auth
  - Sign-in and user creation flow for OAuth providers.
- user
  - Profile completion, pincode validation, user profile retrieval.
- wallet
  - Spendable wallet balance, reversal wallet, immutable-like ledger entries.
- payment
  - Checkout orchestration and payment provider abstraction/mock provider.
- utility
  - Recharge API skeleton returning simulated success reference.
- transaction
  - Transaction entity/repository and filterable transaction listing endpoint.
- royalty
  - Royalty config persistence and cashback/vendor/pincode pool handling.
- referral
  - Referrer bonus credit to wallet.
- job
  - Scheduled heartbeat task.
- meta
  - Health/status metadata endpoint.
- config and exception
  - Security policy and exception handling infrastructure.

## 4.3 Implemented backend APIs

### Authentication

- POST /api/auth/sign-in/google
- POST /api/auth/sign-in/apple

Behavior:
- Validates provider ID and email.
- Finds existing user by provider+providerId or email.
- Creates new user if not found.
- Returns generated token (UUID), userId, profileComplete flag.

### User profile

- POST /api/user/complete-profile
- GET /api/user/profile/{userId}

Behavior:
- Validates userId and 6-digit pincode.
- Confirms pincode exists and active.
- Prevents re-completion once profile is marked complete.
- Stores registered pincode and optional numeric referral linkage.

### Wallet

- GET /api/wallet/balance/{userId}
- POST /api/wallet/balance/credit
- POST /api/wallet/balance/debit
- GET /api/wallet/ledger/{userId}
- GET /api/wallet/reversal/{userId}
- POST /api/wallet/reversal/credit
- GET /api/wallet/activity/ledger/{userId}

Behavior:
- Maintains wallet balance by user.
- Rejects non-positive credit/debit operations.
- Rejects debit when funds are insufficient.
- Writes ledger entries for credit/debit operations.
- Supports reversal wallet credit and retrieval.

### Checkout and utility

- POST /api/checkout
- POST /api/utility/recharge

Checkout behavior:
- Applies reversal wallet first when requested.
- Applies spendable wallet second.
- Sends remainder to payment gateway mock.
- Persists transaction record.
- On gateway failure, restores funds.
- On success, applies cashback and referral bonus.

Recharge behavior:
- Simulates successful recharge and returns generated reference.

### Transactions

- GET /api/transactions

Supports filters for:
- userId
- type
- status
- from datetime
- to datetime

### Royalty and pincode pool admin

- GET /api/admin/royalty
- POST /api/admin/royalty
- GET /api/admin/pincode-pool/top

Behavior:
- Read and upsert royalty configuration.
- Returns pincode pools sorted by highest pool balance.

### Admin operations

- POST /api/admin/fund/{userId}?amount=
- POST /api/admin/pincode
- GET /api/admin/pincode
- DELETE /api/admin/pincode/{pincode}
- GET /api/admin/status

Behavior:
- Admin can credit user wallet and modify pincode master data.
- Writes admin audit logs for actions.

### Meta and scheduler

- GET /api/meta/status
- Scheduled hourly heartbeat log in JobScheduler.

## 4.4 Data model and persistence

Defined in migration scripts and matching JPA entities.

Main tables from backend/src/main/resources/db/migration/V1__init.sql:

- users
- pincodes
- wallet_balance
- reversal_wallet
- ledger_entries
- transactions
- vendors
- pincode_pool
- royalty_configuration
- admin_audit_log

Seed data from V2__seed_data.sql:

- Default royalty percentages
- Sample pincodes (Bengaluru, New Delhi, Mumbai)
- Initial admin audit row

## 4.5 Tests present

- backend/src/test/java/com/viralpe/wallet/WalletServiceTest.java
  - Verifies wallet credit/debit and reversal wallet credit behavior.
- backend/src/test/java/com/viralpe/payment/CheckoutServiceTest.java
  - Verifies checkout wallet use, gateway call, and cashback invocation.

Current tests are unit-level and focused on core service behavior only.

## 5. Frontend behavior details

The frontend now implements a real authenticated flow:

1. Home page renders real Google Sign-In via Google Identity Services.
2. ID token is posted to backend `/api/auth/sign-in/google`.
3. Backend verifies token with Google, links/provisions user, and returns auth response.
4. Home page also provides explicit demo mode with `NEW` and `RETURNING` user options.
5. Home page also provides explicit provider options (`GOOGLE` and `APPLE`) with demo fallback.
5. If `profileComplete=false`, user is routed to onboarding and profile is completed via API (mandatory for new users).
6. If `profileComplete=true`, user lands directly on dashboard (returning users).
7. Onboarding validates pincode using master lookup and requires user confirmation of city/district/state.
8. Onboarding supports optional referral/onboarding code; invalid code does not block completion.
9. Dashboard loads live profile, wallet, reversal, and ledger data from backend APIs.

Notes:

- Frontend route guards enforce sign-in and profile completion.
- Apple sign-in is currently displayed as a disabled upcoming option.

## 6. Business flow mapping to implementation

The PRD defines major flows. Implementation status:

- OAuth sign-in and profile completion: partially implemented.
- Multi-ledger wallet: base wallet + reversal + ledger entries implemented, but full immutable ledger taxonomy from PRD is not fully separated yet.
- Zero-load checkout: implemented in simplified form.
- Cashback and referral split: implemented in simplified form.
- Vendor royalty: partially implemented.
- Pincode championship winner cron and payout: not fully implemented yet.
- End-of-day reversal refund to source: not implemented yet.
- Real payment provider integration: mocked.

## 7. Generated, temporary, and tool artifacts

- backend/target/
  - Maven build output and test report artifacts.
- frontend/dist/
  - Built static frontend assets.
- frontend/node_modules/
  - Installed npm dependencies.
- .github/modernize/java-upgrade/ and backend/.github/modernize/java-upgrade/
  - Modernization assistant workflow hooks, plans, and logs.
- tmp_docx_extract/
  - Temporary extraction directory.

## 8. Development runbook

### Backend

1. Ensure Java 21 and PostgreSQL are available.
2. Configure database matching application.yml credentials.
3. Run Maven build and start Spring Boot app in backend/.

### Frontend

1. Install npm dependencies in frontend/.
2. Run Vite dev server on port 3000.
3. Calls to /api are proxied to backend port 8080.

## 9. Known gaps and suggested priorities

1. Harden security rules and add real authentication token validation.
2. Replace open permitAll policy with role-based route protection.
3. Implement real payment/utility provider integrations.
4. Complete pincode championship scheduler and payout lifecycle.
5. Add integration tests and controller-level tests.
6. Align ARCHITECTURE.md with current Java implementation to avoid onboarding confusion.
7. Consolidate or remove duplicate root scaffold folders if they are not used.

## 10. Purpose of this summary file

This file is intended as the teammate handoff reference:

- Understand what is already built.
- Know where each feature lives.
- Identify what is prototype-only versus production-ready.
- Quickly find docs, code paths, and next implementation priorities.
