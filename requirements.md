# Product Requirement Document (PRD)

**Project Name:** ViralPe Web Application  
**Version:** 5.0 (Unified Master Production Blueprint)  
**Target Release:** Q3 2026  

## 1. Executive Summary & Objectives

ViralPe is a transactional fintech web application operating on a zero-load checkout architecture backed by a unified liquid balance model. Instead of maintaining a pre-funded prepaid wallet, the system dynamically calculates and applies user rewards, referral splits, and complex regional/vendor royalties directly at the point of sale.

All user incentives are tracked via isolated, immutable, read-only informational ledgers that act as data visualizers. Actual transactional liquidity is concentrated strictly into a single spendable **Wallet Balance** and a time-bound **Reversal Wallet**.

The platform features a gamified, time-aggregated **Pincode Royalty Engine** that displays a live progressive pool ticker to all users within a postal code. This pool is awarded as a milestone jackpot to the single highest-earning user registered in that pincode over a configurable, phased cadence (Daily, Weekly, or Monthly).

## 2. Module 1: User Onboarding & Registration

The entire ecosystem relies on accurate identity and geographical data gathered seamlessly during the initial sign-up process.

```
[Google / Apple ID Sign-In]
            │
            ▼ (Account Provisioned)
[Mandatory Profile Completion Screen]
            │
  ┌─────────┴─────────┐
  ▼                   ▼
[Pincode Entry]     [Referral / Onboarding Code]
  (Geo-Validated)     (Links Vendor or Referrer)
```

### 2.1 Authentication Layer

* **OAuth Only:** To ensure maximum security and low friction, registration and subsequent logins occur strictly via **Google Sign-In** or **Apple ID**.
* **Profile Linkage:** Upon first login, the system provisions a unique ViralPe User ID tied permanently to the social sign-in provider's unique identifier, alongside fields for name and email.

### 2.2 Mandatory Profile Completion

If a user is new, they bypass the main dashboard and are routed directly to a mandatory onboarding screen. They cannot execute any transaction or access features until providing:

* **Registered Pincode:** The user must enter their primary physical pincode.
  * *Validation:* The system hits an internal lookup table (mapped to a master postal directory) to verify that the pincode is valid and dynamically displays the associated **City / District / State** for user confirmation.
  * *Immutability:* Once submitted, this pincode is **locked (immutable)** to prevent users from manipulating the geographic royalty pools.
* **Referral / Onboarding Code (Optional):** A field to enter a code, establishing one of two relationships:
  * *Standard Referral:* Links the new user to an existing user (`referred_by_user_id`).
  * *Vendor Linkage:* Links a commercial merchant profile to the specific user who physically onboarded them (`onboarded_by_user_id`).

## 3. Module 2: Multi-Ledger Wallet Architecture

The wallet engine separates **Informational Ledgers** (read-only tracking) from **Liquid Pools** (spendable at checkout).

```
+-------------------------------------------------------------------------+
|                         VIRALPE WALLET LAYOUT                           |
+-------------------------------------------------------------------------+
| [ LIQUID / SPENDABLE POOLS ]                                            |
|   ├── Wallet Balance (Earnings + Platform Add-on Funds)                 |
|   └── Reversal Wallet (Same-day failed transaction escrow)              |
+-------------------------------------------------------------------------+
| [ INFORMATIONAL / READ-ONLY LEDGERS ]                                   |
|   ├── Cashback Ledger         ├── Referral Ledger                       |
|   ├── Vendor Royalty Ledger   ├── Pincode Royalty Ledger                |
|   └── Total Earnings Ledger (Sum of all 4 trackers: CB + REF + VN + PC) |
+-------------------------------------------------------------------------+
```

### 3.1 Informational / Read-Only Ledgers (Non-Spendable)

These buckets act as point-accumulation counters displayed on the user dashboard. They **cannot** be directly drawn from at checkout:

* **Cashback Ledger:** Tracks cumulative lifetime cashback earned by the user from their own direct utility actions.
* **Referral Ledger:** Tracks cumulative lifetime earnings generated from transactions made by their referees.
* **Vendor Royalty Ledger:** Tracks cumulative lifetime commissions earned from transactions occurring at vendors this user successfully onboarded.
* **Pincode Royalty Ledger:** Tracks cumulative lifetime winnings secured from winning the *Pincode Royalty Championship* cycles.
* **Total Earnings Ledger:** A master visual tracker showing the absolute mathematical sum of the four tracking ledgers above.

### 3.2 Liquid / Spendable Pools

Only two entities provide actual monetary liquidity at the checkout screen:

1. **Wallet Balance:** The true spendable engine. This balance is dynamically populated by two sources:
   * *The System Pipeline:* Real-time automated routing of approved earnings or processed payouts from the royalty engines (e.g., winning a Pincode Championship).
   * *ViralPe Add-On Funds:* Discretionary promotional funds, campaign injections, or adjustments added directly by the ViralPe platform administration from separate company budgets.
2. **Reversal Wallet:** Temporary holding bucket for failed transactions.

## 4. Module 3: Zero-Load Checkout & Mixed-Mode Payment Flow

### 4.1 Payment Processing Rules

ViralPe does not feature a "Deposit/Load Money" button. When an invoice is generated for a utility bill or voucher, the checkout interface calculates the net payable amount using a strict priority ladder:

1. **Reversal Wallet Balance:** Applied automatically first if funds are present.
2. **Wallet Balance:** The user can toggle to use their liquid balance completely, partially, or not at all.
3. **Payment Gateway (PG):** The remaining delta is paid via real-time UPI, Cards, or Net Banking.

### 4.2 Failed Transaction & Same-Day Reversal Escrow

* **Instant Credit:** If a third-party transaction fails post-payment gateway debit, the exact amount is instantly credited to the **Reversal Wallet**.
* **Intraday Allocation:** Spendable on any transaction within the **same calendar day** (up to 23:59:59 server time).
* **Automated EOD Reversion:** At midnight, an automated server cron job sweeps the Reversal Wallet and executes a programmatic Refund-to-Source API command to route the money directly back to the user's original bank account.

## 5. Module 4: Third-Party API Integrations

The platform integrates with three primary categories of external infrastructure:

* **Utility & Bill Payments:** Integration via aggregators (e.g., PayU, Setu, BillAvenue) facilitating real-time mobile recharges and BBPS bill collections.
* **Vouchers:** Brand digital gift cards via programmatic voucher APIs.
* **Payment Gateway:** High-throughput payment gateways for immediate checkout collection.

## 6. Module 5: The Royalty & Margin-Split Engine

Every bonus and royalty is funded strictly out of the third-party profit margin ($Gross\ Paid - API\ Cost$) and calculated **instantly upon transaction success**.

### 6.1 Referral Bonus Workflow

* **Calculation:** A percentage of the transaction profit margin.
* **Route:** Credited **instantly** to the referrer's liquid **Wallet Balance** while simultaneously appending to their read-only **Referral Ledger** and increasing their **Total Earnings Ledger**.

### 6.2 User Cashback Workflow (Double-Deduction Engine)

1. System determines the raw user cashback amount from the profit margin.
2. A specified fraction is stripped out and routed to the **Pincode Royalty Pool** matching the *User’s registered pincode*.
3. The net remaining cashback is credited **instantly** to the user's liquid **Wallet Balance**, logged under their **Cashback Ledger**, and increases their **Total Earnings Ledger**.

### 6.3 Vendor Royalty Workflow

1. System determines the raw vendor commission from the profit margin.
2. A specified fraction is stripped out and routed to the **Pincode Royalty Pool** matching the *Vendor’s business pincode*.
3. The net remaining commission is credited **instantly** to the liquid **Wallet Balance** of the specific user who onboarded that vendor (`onboarded_by_user_id`). It simultaneously appends to their **Vendor Royalty Ledger** and increases their **Total Earnings Ledger**.

### 6.4 Flexible Pincode Royalty Championship (Live Ticker & Phased Processing)

Pincode Royalties are aggregated into a centralized geographic pool for each postal code. The engine transitions through phased rollouts over time, maintaining a transparent, live financial ticker on every user's dashboard to drive competition.

```
[Transactions Occur] ──► Slices carved out ──► Deposited into [Centralized Pincode Pool]
                                                            │
                                                            ▼ (Displayed Live on Dashboards)
                                                     [Live Pincode Ticker]
                                                            │
                                                            ▼ [Cron Evaluates Active Phase]
                                             Identify Highest Transactional Earner in Pincode
                                                            │
                                             ┌──────────────┴──────────────┐
                                             ▼                             ▼
                                        (For Winner)             (For All Other Users)
                                  ├─► Credits Wallet Balance        └─► Ticker locks history
                                  ├─► Appends Pincode Ledger            Resets to ₹0 for next cycle
                                  └─► Increases Total Earnings
```

#### 1. The Live Pincode Ticker Display

* Every user, upon logging into the application, will see a dynamic display showing the **Total Accumulated Earnings Pool** for their specific registered pincode.
* For all users who do not win the championship at the end of the cycle, this number remains a permanent historical and real-time informational visual of what their neighborhood generated. It does **not** convert into personal spendable balance.

#### 2. Phased Activation Cadence (Admin Controlled)

The system engine supports three execution windows managed via a global configuration flag in the administrative backend:

* **Phase 1 (Initial Launch Default):** *Daily Earning Championship.* The evaluation cron runs every night at 23:59:59 server time. The pool resets to ₹0 daily.
* **Phase 2 (Subsequent Activation):** *Weekly Earning Championship.* The countdown and accumulation stretch across the calendar week, executing and resetting on Sunday at 23:59:59 server time.
* **Phase 3 (Final Activation):** *Monthly Earning Championship.* The final volume cycle, executing and resetting on the final second of the calendar month.

#### 3. Execution & Winner Payout Flow

* At the exact closing second of the active phase window, the system queries the logs to isolate the **highest single transactional earner** registered within that specific pincode.
* **For the Winner:** The system executes an atomic transaction:
  1. The total accumulated pool amount is pushed to their liquid **Wallet Balance** (making it instantly spendable).
  2. The amount is added to their read-only **Pincode Royalty Ledger**.
  3. Their **Total Earnings Ledger** increments by that exact sum.
* **For Non-Winners:** Personal wallet balances remain unaffected. The ticker on their dashboard locks the historical pool total for that completed period before initializing the new running ticker for the next cycle.

### 6.5 Vertical Royalty Workflow

* Applied at the root level of the profit margin calculation before calculating individual cashback/commission pools to account for varying category margins across API providers.

## 7. Preliminary Technical Data Architecture

To assist the engineering team in setting up the database relationships, the core tables must reflect the tracking of live pincode pools alongside user and vendor configurations:

### 7.1 Users Table (`users`)

* `user_id` (Primary Key)
* `auth_provider_id` (Unique Google/Apple ID claim)
* `registered_pincode` (Foreign Key -> Pincode Master Directory)
* `referred_by_user_id` (Foreign Key -> Users Table)

### 7.2 Vendors Table (`vendors`)

* `vendor_id` (Primary Key)
* `onboarded_by_user_id` (Foreign Key -> Users Table)
* `vendor_pincode` (Postal code where business is physically registered)

### 7.3 Pincode Pools Table (`pincode_pools`)

* `pincode` (Primary Key)
* `current_cycle_pool` (Decimal - Running total displayed live to all users in this pincode)
* `active_phase` (Enum: DAILY, WEEKLY, MONTHLY)
* `last_cycle_winner_user_id` (Foreign Key -> Users Table)
* `last_cycle_total_payout` (Decimal - Locked final value of previous championship pool)