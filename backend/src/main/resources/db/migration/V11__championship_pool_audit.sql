ALTER TABLE pincode_pool
    ADD COLUMN IF NOT EXISTS current_cycle_pool DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS last_cycle_winner_user_id BIGINT,
    ADD COLUMN IF NOT EXISTS last_cycle_total_payout DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS cycle_started_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_cycle_ended_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS pincode_pool_contribution (
    id BIGSERIAL PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL,
    source_transaction_id BIGINT,
    source_user_id BIGINT,
    contribution_type VARCHAR(50),
    amount DOUBLE PRECISION NOT NULL,
    source_reference VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS pincode_royalty_ledger (
    id BIGSERIAL PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL,
    winner_user_id BIGINT,
    source_transaction_id BIGINT,
    pool_amount DOUBLE PRECISION,
    cycle_end_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);
