CREATE TABLE IF NOT EXISTS cashback_ledger (
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
