-- Add archived_at to projects (NULL = not archived)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_archived_at ON projects(archived_at);
