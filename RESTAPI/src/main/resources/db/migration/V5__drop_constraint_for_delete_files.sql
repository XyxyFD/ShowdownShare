ALTER TABLE audit_log DROP CONSTRAINT fk_audit_file;

ALTER TABLE audit_log
    ALTER COLUMN file_id DROP NOT NULL;

ALTER TABLE audit_log
    ADD CONSTRAINT fk_audit_file
        FOREIGN KEY (file_id) REFERENCES file_meta(id) ON DELETE SET NULL;
