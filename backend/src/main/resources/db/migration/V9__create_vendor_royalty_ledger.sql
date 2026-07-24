CREATE TABLE vendor_royalty_ledger
(
    id BIGSERIAL PRIMARY KEY,

    vendor_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    transaction_id BIGINT,

    royalty_amount NUMERIC(19,2) NOT NULL,

    running_total NUMERIC(19,2) NOT NULL,

    transaction_type VARCHAR(50) NOT NULL,

    business_pincode VARCHAR(10) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_vendor_royalty_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES vendors(id)
);

CREATE INDEX idx_vendor_royalty_vendor
ON vendor_royalty_ledger(vendor_id);

CREATE INDEX idx_vendor_royalty_user
ON vendor_royalty_ledger(user_id);

CREATE INDEX idx_vendor_royalty_created_at
ON vendor_royalty_ledger(created_at);

CREATE INDEX idx_vendor_royalty_pincode
ON vendor_royalty_ledger(business_pincode);