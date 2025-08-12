-- Migration: Add 'status' column to 'bots' table
ALTER TABLE bots ADD COLUMN status VARCHAR NOT NULL DEFAULT 'active';