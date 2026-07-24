-- Initial schema for ViralPe backend

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    auth_provider VARCHAR(100),
    auth_provider_id VARCHAR(255),
    full_name VARCHAR(255),
    email VARCHAR(255),
    registered_pincode VARCHAR(6),
    profile_complete BOOLEAN DEFAULT false,
    referred_by_user_id BIGINT,
    onboarded_by_user_id BIGINT
);

CREATE TABLE pincodes (
    pincode VARCHAR(6) PRIMARY KEY,
    city VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    active BOOLEAN DEFAULT true
);

CREATE TABLE wallet_balance (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    balance DOUBLE PRECISION DEFAULT 0.0
);

CREATE TABLE reversal_wallet (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    balance DOUBLE PRECISION DEFAULT 0.0,
    expires_at VARCHAR(50)
);

CREATE TABLE ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    category VARCHAR(100),
    amount DOUBLE PRECISION,
    source_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    transaction_type VARCHAR(100),
    amount DOUBLE PRECISION,
    status VARCHAR(50),
    provider VARCHAR(100),
    reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE vendors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    vendor_code VARCHAR(100),
    onboarded_pincode VARCHAR(6),
    royalty_percentage DOUBLE PRECISION,
    active BOOLEAN DEFAULT true
);

CREATE TABLE pincode_pool (
    id BIGSERIAL PRIMARY KEY,
    pincode VARCHAR(6),
    pool_balance DOUBLE PRECISION DEFAULT 0.0,
    active BOOLEAN DEFAULT true
);

CREATE TABLE royalty_configuration (
    id BIGSERIAL PRIMARY KEY,
    cashback_percentage DOUBLE PRECISION,
    referral_percentage DOUBLE PRECISION,
    vendor_royalty_percentage DOUBLE PRECISION,
    pincode_deduction_fraction DOUBLE PRECISION,
    active BOOLEAN DEFAULT true
);

CREATE TABLE cashback_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source_transaction_id BIGINT,
    transaction_type VARCHAR(100),
    gross_cashback DOUBLE PRECISION,
    pincode_deduction DOUBLE PRECISION,
    net_cashback DOUBLE PRECISION,
    cashback_percentage DOUBLE PRECISION,
    pincode_percentage DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE admin_audit_log (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT,
    action VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);
