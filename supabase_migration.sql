-- Add current_question column to sessions table
-- This allows the admin to control which question participants are currently voting on

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS current_question INTEGER DEFAULT 0;

-- Set existing sessions to start at question 0
UPDATE sessions SET current_question = 0 WHERE current_question IS NULL;
