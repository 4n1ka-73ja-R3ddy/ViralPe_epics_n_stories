CREATE TABLE IF NOT EXISTS referral_bonus (
    id BIGSERIAL PRIMARY KEY,
    referrer_user_id BIGINT,
    referee_user_id BIGINT,
    source_transaction_id BIGINT,
    transaction_amount DOUBLE PRECISION,
    api_cost DOUBLE PRECISION,
    profit_margin DOUBLE PRECISION,
    referral_percentage DOUBLE PRECISION,
    referral_bonus DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
