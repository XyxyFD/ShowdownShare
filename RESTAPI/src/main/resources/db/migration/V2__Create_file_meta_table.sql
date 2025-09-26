-- V2__Create_file_meta_table.sql

-- Datei-Metadaten
CREATE TABLE file_meta (
                           id              SERIAL PRIMARY KEY,
                           owner_id        INTEGER         NOT NULL,
                           username_hash   VARCHAR(255)    NOT NULL,
                           site            VARCHAR(100),
                           s3_key          VARCHAR(255)    NOT NULL,
                           status          VARCHAR(20)     NOT NULL,
                           upload_date     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           CONSTRAINT fk_file_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);


CREATE TABLE audit_log (
                           id          SERIAL PRIMARY KEY,
                           user_id     INTEGER                         NOT NULL,
                           file_id     INTEGER                         NOT NULL,
                           action      VARCHAR(20)                     NOT NULL,
                           "timestamp" TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
                           CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id),
                           CONSTRAINT fk_audit_file FOREIGN KEY (file_id) REFERENCES file_meta(id),
                           CONSTRAINT chk_audit_action CHECK (action IN ('UPLOAD', 'DOWNLOAD'))
    );


