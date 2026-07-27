-- Enhance admin_audit_log table with target_user_id, amount, and reason columns
ALTER TABLE admin_audit_log
ADD COLUMN IF NOT EXISTS target_user_id BIGINT,
ADD COLUMN IF NOT EXISTS amount DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS reason VARCHAR(255);

-- Enhance royalty_configuration with pincode_cashback_fraction, pincode_vendor_fraction, effective_from, updated_at
ALTER TABLE royalty_configuration
ADD COLUMN IF NOT EXISTS pincode_cashback_fraction DOUBLE PRECISION DEFAULT 0.10,
ADD COLUMN IF NOT EXISTS pincode_vendor_fraction DOUBLE PRECISION DEFAULT 0.10,
ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing royalty_configuration records to default fractions if null
UPDATE royalty_configuration
SET pincode_cashback_fraction = 0.10
WHERE pincode_cashback_fraction IS NULL;

UPDATE royalty_configuration
SET pincode_vendor_fraction = 0.10
WHERE pincode_vendor_fraction IS NULL;

UPDATE royalty_configuration
SET effective_from = CURRENT_TIMESTAMP
WHERE effective_from IS NULL;

-- Create royalty_configuration_history for full audit tracking
CREATE TABLE IF NOT EXISTS royalty_configuration_history (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    cashback_percentage DOUBLE PRECISION,
    referral_percentage DOUBLE PRECISION,
    vendor_royalty_percentage DOUBLE PRECISION,
    profit_margin_percentage DOUBLE PRECISION,
    vertical_royalty_percentage DOUBLE PRECISION,
    pincode_cashback_fraction DOUBLE PRECISION,
    pincode_vendor_fraction DOUBLE PRECISION,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    admin_user_id BIGINT,
    change_reason VARCHAR(255)
);
