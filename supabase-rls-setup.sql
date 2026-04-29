-- Run this in Supabase SQL Editor to configure RLS policies

-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- SESSIONS policies
CREATE POLICY "Allow public read access"
ON sessions FOR SELECT
USING (true);

CREATE POLICY "Allow public insert"
ON sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update"
ON sessions FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete"
ON sessions FOR DELETE
USING (true);

-- QUESTIONS policies
CREATE POLICY "Allow public read access"
ON questions FOR SELECT
USING (true);

CREATE POLICY "Allow public insert"
ON questions FOR INSERT
WITH CHECK (true);

-- ANSWERS policies
CREATE POLICY "Allow public read access"
ON answers FOR SELECT
USING (true);

CREATE POLICY "Allow public insert"
ON answers FOR INSERT
WITH CHECK (true);

-- PARTICIPANTS policies
CREATE POLICY "Allow public read access"
ON participants FOR SELECT
USING (true);

CREATE POLICY "Allow public insert"
ON participants FOR INSERT
WITH CHECK (true);

-- VOTES policies
CREATE POLICY "Allow public read access"
ON votes FOR SELECT
USING (true);

CREATE POLICY "Allow public insert"
ON votes FOR INSERT
WITH CHECK (true);
