ALTER TABLE vendors
ADD COLUMN onboarded_by_user_id BIGINT;

// developed by anika teja reddy
ALTER TABLE vendors
ADD CONSTRAINT fk_vendors_onboarded_by_user
FOREIGN KEY (onboarded_by_user_id)
REFERENCES users(id);