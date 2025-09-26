-- V7__create_username_mapping_table.sql
-- Erstellt eine eigenständige Tabelle zum Abbilden von Original- und verschlüsseltem Username.
-- Keine Foreign Keys oder Constraints, die Tabelle steht isoliert.

CREATE TABLE username_mapping (
                                  original_username VARCHAR(255) NOT NULL,
                                  encrypted_username VARCHAR(255) NOT NULL
);
