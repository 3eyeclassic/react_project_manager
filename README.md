# 案件管理ツール

フリーランス向けの案件・クライアント・売上管理アプリ（Notion から React へ移行）。

## 技術スタック

- **フロント**: Vite + React + TypeScript, Tailwind CSS, shadcn/ui, dnd-kit, Zustand, TanStack Query, Recharts
- **バックエンド**: Supabase（PostgreSQL + Auth）
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成し、Supabase の値を設定してください。

```bash
cp .env.example .env.local
```

- `VITE_SUPABASE_URL`: Supabase プロジェクト URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名キー
- （任意）`VITE_DEMO_USER_EMAIL` / `VITE_DEMO_USER_PASSWORD`: デモログイン用

### 3. Supabase セットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で `supabase/migrations/001_initial_schema.sql` の内容を実行
3. デモ用: Auth でユーザー（例: demo@example.com）を作成し、`supabase/seed.sql` 内の `YOUR_DEMO_USER_UUID` をそのユーザーの UUID に置き換えてから seed を実行

### 4. 起動

```bash
npm run dev
```

## スクリプト

- `npm run dev` - 開発サーバー
- `npm run build` - 本番ビルド
- `npm run preview` - ビルドのプレビュー
- `npm run lint` - ESLint
- `npm run format` - Prettier
- `npm run test` - Vitest

## ライセンス

MIT
