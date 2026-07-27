CREATE TABLE IF NOT EXISTS championship_phase_config (
    id BIGSERIAL PRIMARY KEY,
    active_phase VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO championship_phase_config (active_phase, updated_at)
SELECT 'DAILY', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM championship_phase_config);
