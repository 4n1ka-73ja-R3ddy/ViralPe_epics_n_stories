CREATE TABLE vendors
(
    id BIGSERIAL PRIMARY KEY,

    vendor_name VARCHAR(255) NOT NULL,

    business_name VARCHAR(255) NOT NULL,

    business_pincode VARCHAR(10) NOT NULL,

    onboarded_by_user_id BIGINT NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_vendor_business_pincode
ON vendors(business_pincode);

CREATE INDEX idx_vendor_onboarded_user
ON vendors(onboarded_by_user_id);