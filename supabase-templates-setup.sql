-- Question templates table for pre-defined question sets
CREATE TABLE IF NOT EXISTS question_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read templates
CREATE POLICY "Templates are viewable by everyone"
  ON question_templates FOR SELECT
  USING (true);

-- Allow anyone to insert templates
CREATE POLICY "Templates are insertable by everyone"
  ON question_templates FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete templates
CREATE POLICY "Templates are deletable by everyone"
  ON question_templates FOR DELETE
  USING (true);

-- Insert some default templates
INSERT INTO question_templates (name, questions) VALUES
  ('Satisfaction Survey', '[
    {"text": "How satisfied are you with this event?", "answers": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]},
    {"text": "Would you recommend this to others?", "answers": ["Definitely yes", "Probably yes", "Not sure", "Probably no", "Definitely no"]},
    {"text": "How would you rate the organization?", "answers": ["Excellent", "Good", "Average", "Below average", "Poor"]}
  ]'),
  ('Quick Quiz', '[
    {"text": "What is the capital of France?", "answers": ["Paris", "London", "Berlin", "Madrid"]},
    {"text": "Which planet is closest to the Sun?", "answers": ["Mercury", "Venus", "Earth", "Mars"]},
    {"text": "What is 2 + 2?", "answers": ["3", "4", "5", "6"]}
  ]'),
  ('Feedback Form', '[
    {"text": "What did you like most?", "answers": ["Content", "Speaker", "Venue", "Networking"]},
    {"text": "What could be improved?", "answers": ["Timing", "Content depth", "Interaction", "Facilities"]},
    {"text": "Would you attend again?", "answers": ["Yes, definitely", "Maybe", "Probably not", "No"]}
  ]');
