-- Seed admin user, royalty configuration and sample pincodes

INSERT INTO royalty_configuration (cashback_percentage, referral_percentage, vendor_royalty_percentage, pincode_deduction_fraction, active)
VALUES (2.5, 1.0, 5.0, 0.2, true);

-- sample pincodes
INSERT INTO pincodes (pincode, city, district, state, active) VALUES
('560001', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', true),
('110001', 'New Delhi', 'New Delhi', 'Delhi', true),
('400001', 'Mumbai', 'Mumbai', 'Maharashtra', true)
ON CONFLICT DO NOTHING;

-- seed admin audit log example
INSERT INTO admin_audit_log (admin_user_id, action, details, created_at)
VALUES (0, 'INIT_SEED', 'Seeded default royalty config and pincodes', now());
