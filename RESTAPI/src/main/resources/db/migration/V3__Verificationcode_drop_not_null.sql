ALTER TABLE users
  ALTER COLUMN verification_code DROP NOT NULL,
  ALTER COLUMN verification_expired DROP NOT NULL;