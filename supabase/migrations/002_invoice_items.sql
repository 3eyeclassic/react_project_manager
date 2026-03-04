-- invoice_items: 1請求書に複数案件を紐付け
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  amount numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_project_id ON invoice_items(project_id);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_items_rls" ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- invoices に client_id を追加（請求先クライアント）
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE RESTRICT;

-- 既存データ: project から client_id を取得
UPDATE invoices
SET client_id = (SELECT client_id FROM projects WHERE projects.id = invoices.project_id)
WHERE client_id IS NULL AND project_id IS NOT NULL;

-- 既存の請求を invoice_items に移行（1請求 = 1明細）
INSERT INTO invoice_items (invoice_id, project_id, amount, updated_at)
SELECT id, project_id, amount, updated_at
FROM invoices
WHERE project_id IS NOT NULL;

-- client_id を NOT NULL に（移行済みの行のみ）
ALTER TABLE invoices ALTER COLUMN client_id SET NOT NULL;

-- invoices から project_id を削除
ALTER TABLE invoices DROP COLUMN IF EXISTS project_id;

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
