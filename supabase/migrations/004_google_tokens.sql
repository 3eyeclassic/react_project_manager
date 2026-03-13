-- google_tokens: store OAuth tokens for Google Calendar (Edge Functions use Service Role to read/write)
CREATE TABLE IF NOT EXISTS google_tokens (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "google_tokens_rls" ON google_tokens
  FOR ALL USING (auth.uid() = user_id);
