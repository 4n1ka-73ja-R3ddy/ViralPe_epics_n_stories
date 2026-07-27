ALTER TABLE royalty_configuration
ADD COLUMN category VARCHAR(50) DEFAULT 'GENERAL',
ADD COLUMN vertical_royalty_percentage DOUBLE PRECISION DEFAULT 0.0;

-- Update existing default record if present
UPDATE royalty_configuration
SET category = 'GENERAL'
WHERE category IS NULL;

-- Insert initial category defaults if not already present
INSERT INTO royalty_configuration (category, profit_margin_percentage, vertical_royalty_percentage, cashback_percentage, referral_percentage, vendor_royalty_percentage, pincode_deduction_fraction, active)
SELECT 'RECHARGE', 5.0, 1.5, 20.0, 10.0, 5.0, 0.1, true
WHERE NOT EXISTS (SELECT 1 FROM royalty_configuration WHERE category = 'RECHARGE');

INSERT INTO royalty_configuration (category, profit_margin_percentage, vertical_royalty_percentage, cashback_percentage, referral_percentage, vendor_royalty_percentage, pincode_deduction_fraction, active)
SELECT 'BILL', 3.0, 1.0, 15.0, 10.0, 5.0, 0.1, true
WHERE NOT EXISTS (SELECT 1 FROM royalty_configuration WHERE category = 'BILL');

INSERT INTO royalty_configuration (category, profit_margin_percentage, vertical_royalty_percentage, cashback_percentage, referral_percentage, vendor_royalty_percentage, pincode_deduction_fraction, active)
SELECT 'VOUCHER', 8.0, 2.0, 25.0, 12.0, 8.0, 0.1, true
WHERE NOT EXISTS (SELECT 1 FROM royalty_configuration WHERE category = 'VOUCHER');
