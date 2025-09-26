-- V6__drop_hand_histories_table.sql
-- Entfernt die nicht mehr benötigte Tabelle 'hand_histories'.
-- IF EXISTS macht das Statement idempotenter, falls sie bereits manuell gelöscht wurde.

DROP TABLE IF EXISTS hand_histories;
