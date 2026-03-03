-- デモ用シードデータ
-- 実行前に Supabase Dashboard でデモユーザー（例: demo@example.com）を作成し、
-- そのユーザーの UUID を取得して、下の 'YOUR_DEMO_USER_UUID' を置き換えてから実行してください。

DO $$
DECLARE
  demo_user_id uuid := '6f5d9745-07f9-4b32-9b7e-a3e6fe7ff316';
  c1 uuid;
  c2 uuid;
  c3 uuid;
BEGIN
  -- クライアント 3 社
  INSERT INTO clients (id, user_id, name, company_name, representative, billing_email, phone, address, notes, created_at, updated_at)
  VALUES
    (gen_random_uuid(), demo_user_id, '山田太郎', '株式会社サンプル', '山田 太郎', 'billing@sample.co.jp', '03-1234-5678', '東京都渋谷区〇〇 1-2-3', NULL, now(), now())
  RETURNING id INTO c1;

  INSERT INTO clients (id, user_id, name, company_name, representative, billing_email, phone, address, notes, created_at, updated_at)
  VALUES
    (gen_random_uuid(), demo_user_id, '佐藤花子', '有限会社デモ商事', '佐藤 花子', 'info@demo-shouji.co.jp', '06-9876-5432', '大阪府大阪市△△ 4-5-6', NULL, now(), now())
  RETURNING id INTO c2;

  INSERT INTO clients (id, user_id, name, company_name, representative, billing_email, phone, address, notes, created_at, updated_at)
  VALUES
    (gen_random_uuid(), demo_user_id, '鈴木一郎', '合同会社テック', '鈴木 一郎', 'contact@tech-llc.jp', NULL, NULL, '常連クライアント', now(), now())
  RETURNING id INTO c3;

  -- 案件（各ステータスに分散、8件）
  INSERT INTO projects (id, user_id, client_id, name, category, status, sub_status, billing_type, amount, hourly_rate, priority, progress, start_date, end_date, payment_date, created_at, updated_at)
  VALUES
    (gen_random_uuid(), demo_user_id, c1, 'Webサイトリニューアル', '新規開発', 'not_started', NULL, 'fixed', 500000, NULL, 'high', 0, NULL, NULL, NULL, now(), now()),
    (gen_random_uuid(), demo_user_id, c1, 'LP制作', '新規開発', 'in_progress', 'in_progress', 'fixed', 300000, NULL, 'medium', 40, (current_date - 30), (current_date + 14), NULL, now(), now()),
    (gen_random_uuid(), demo_user_id, c2, '月次保守', '保守', 'in_progress', 'waiting_client', 'hourly', NULL, 5000, 'low', 80, (current_date - 60), (current_date + 30), NULL, now(), now()),
    (gen_random_uuid(), demo_user_id, c2, 'API開発', '新規開発', 'completed', 'invoice_ready', 'fixed', 800000, NULL, 'high', 100, (current_date - 90), (current_date - 7), NULL, now(), now()),
    (gen_random_uuid(), demo_user_id, c3, '運用代行', '運用', 'completed', 'invoiced', 'hourly', NULL, 4000, 'medium', 100, (current_date - 45), (current_date - 10), NULL, now(), now()),
    (gen_random_uuid(), demo_user_id, c1, 'キャンペーンLP', '新規開発', 'payment_received', 'paid', 'fixed', 200000, NULL, 'medium', 100, (current_date - 120), (current_date - 60), (current_date - 45), now(), now()),
    (gen_random_uuid(), demo_user_id, c3, '障害対応', '保守', 'payment_received', 'paid', 'hourly', NULL, 6000, 'high', 100, (current_date - 30), (current_date - 5), (current_date - 2), now(), now()),
    (gen_random_uuid(), demo_user_id, c2, '社内ツール開発', 'その他', 'in_progress', 'in_progress', 'fixed', 600000, NULL, 'medium', 25, (current_date - 14), (current_date + 45), NULL, now(), now());
END $$;
