# Supabase設定ガイド

このガイドでは、画像のメタデータ（user_key、name_tag、created_at、delete_token）をSupabaseで管理するための設定手順を説明します。

## ステップ1: Supabaseアカウントの作成

1. [Supabaseの公式サイト](https://supabase.com/)にアクセス
2. 「Start your project」または「Sign Up」をクリック
3. GitHubアカウントでログイン（推奨）またはメールアドレスでアカウント作成
4. メール認証を完了

## ステップ2: プロジェクトの作成

1. Supabaseダッシュボードにログイン
2. 「New Project」をクリック
3. 以下の情報を入力：
   - **Name**: プロジェクト名（例: `cheki-bum`）
   - **Database Password**: データベースのパスワード（安全なパスワードを設定）
   - **Region**: 最寄りのリージョンを選択（例: `Northeast Asia (Tokyo)`）
4. 「Create new project」をクリック
5. プロジェクトの作成が完了するまで待機（1-2分）

## ステップ3: APIキーの取得

1. プロジェクトが作成されたら、左側メニューから **Settings**（設定）をクリック
2. **API** タブをクリック
3. 以下の情報を確認：
   - **Project URL**: `https://hfpnjgwfhjtaiilankxw.supabase.co` の形式
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcG5qZ3dmaGp0YWlpbGFua3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODY1NDYsImV4cCI6MjA3ODk2MjU0Nn0.FfXshUogIIV51gANRRvXkRfYG1KS3KA_ZO8mdHQRntQ` で始まる長い文字列

## ステップ4: データベーステーブルの作成

1. 左側メニューから **SQL Editor** をクリック
2. 「New query」をクリック
3. 以下のSQLを実行：

```sql
-- photosテーブルを作成
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_key TEXT NOT NULL,
  name_tag TEXT,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  delete_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成（検索を高速化）
CREATE INDEX IF NOT EXISTS idx_photos_user_key ON photos(user_key);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- RLS（Row Level Security）を有効化
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- パブリックアクセスを許可（開発用）
-- 本番環境では適切なRLSポリシーを設定してください
CREATE POLICY "Allow public read access" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON photos
  FOR DELETE USING (true);

CREATE POLICY "Allow public update access" ON photos
  FOR UPDATE USING (true);
```

4. 「Run」ボタンをクリックして実行
5. 成功メッセージが表示されれば完了

## ステップ5: config.jsの設定

`config.js`ファイルを開き、Supabaseの設定を追加：

```javascript
const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL', // ステップ3で取得したProject URL
  anonKey: 'YOUR_SUPABASE_ANON_KEY', // ステップ3で取得したanon public key
};
```

### 具体例

```javascript
const SUPABASE_CONFIG = {
  url: 'https://abcdefghijklmnop.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2ODAwMCwiZXhwIjoxOTU0NTQ0MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};
```

## ステップ6: 動作確認

1. ブラウザでアプリを開く
2. 開発者ツール（F12）のConsoleタブを開く
3. 画像をアップロード
4. コンソールに「✅ Supabaseに保存成功」が表示されれば成功
5. Supabaseダッシュボードの **Table Editor** で `photos` テーブルを確認し、データが保存されているか確認

## データベーススキーマ

### photosテーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー（自動生成） |
| user_key | TEXT | ユーザー識別キー |
| name_tag | TEXT | タグ名（写っている人の名前） |
| cloudinary_url | TEXT | Cloudinaryの画像URL |
| cloudinary_public_id | TEXT | Cloudinaryのpublic_id |
| delete_token | TEXT | 削除用トークン（オプション） |
| created_at | TIMESTAMP | 作成日時（自動設定） |
| updated_at | TIMESTAMP | 更新日時（自動設定） |

## トラブルシューティング

### エラー: "relation 'photos' does not exist"

- SQL Editorでテーブル作成SQLが正しく実行されたか確認
- Table Editorでテーブルが存在するか確認

### エラー: "new row violates row-level security policy"

- RLSポリシーが正しく設定されているか確認
- 開発用のパブリックアクセスポリシーが作成されているか確認

### データが保存されない

- ブラウザのコンソールでエラーメッセージを確認
- SupabaseのAPIキーが正しく設定されているか確認
- Networkタブでリクエストが成功しているか確認

## セキュリティについて

- **開発環境**: 現在の設定ではパブリックアクセスを許可しています
- **本番環境**: 適切なRLSポリシーを設定して、ユーザーごとにデータを分離してください
- **APIキー**: `anonKey`は公開されても問題ありませんが、`service_role`キーは絶対に公開しないでください

