-- Add payment breakdown columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS reversal_amount_applied DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS wallet_amount_applied DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS payment_gateway_amount DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS refund_to_reversal DOUBLE PRECISION DEFAULT 0.0;
