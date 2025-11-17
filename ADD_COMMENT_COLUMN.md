# Supabaseにコメントカラムを追加する手順

## ステップ1: Supabaseダッシュボードにアクセス

1. [Supabaseダッシュボード](https://supabase.com/dashboard)にログイン
2. プロジェクトを選択

## ステップ2: SQL Editorを開く

1. 左側メニューから **SQL Editor** をクリック
2. 「New query」をクリックして新しいクエリを作成

## ステップ3: コメントカラムを追加

以下のSQLを実行してください：

```sql
-- photosテーブルにcommentカラムを追加
ALTER TABLE photos ADD COLUMN IF NOT EXISTS comment TEXT;
```

## ステップ4: 確認

1. 左側メニューから **Table Editor** をクリック
2. `photos` テーブルを選択
3. テーブルのカラム一覧に `comment` が追加されているか確認

## 完了

これで、画像を追加する際に入力したコメントがSupabaseに保存されるようになります。

## 補足

- `TEXT`型を使用しているため、長いコメントも保存可能です
- `IF NOT EXISTS`を使用しているため、既にカラムが存在する場合はエラーになりません
- 既存のデータには`NULL`が設定されます（問題ありません）

