CREATE TABLE IF NOT EXISTS n8n_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_n8n_events_created ON n8n_events(created_at DESC);

ALTER TABLE n8n_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY n8n_events_select ON n8n_events
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.auth_role() = 'responsable'
  );

CREATE POLICY n8n_events_insert_service ON n8n_events
  FOR INSERT TO authenticated
  WITH CHECK (true);
