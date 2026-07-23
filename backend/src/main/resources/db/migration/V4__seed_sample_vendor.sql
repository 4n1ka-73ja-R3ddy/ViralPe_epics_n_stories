INSERT INTO vendors (
    name,
    vendor_code,
    onboarded_pincode,
    onboarded_by_user_id,
    royalty_percentage,
    active
)
SELECT
    'ViralPe Demo Vendor',
    'VENDOR101',
    '560001',
// developed by anika teja reddy
    1,
    2.50,
    true
WHERE EXISTS (
    SELECT 1
    FROM users
    WHERE id = 1
)
AND NOT EXISTS (
    SELECT 1
    FROM vendors
    WHERE vendor_code = 'VENDOR101'
);