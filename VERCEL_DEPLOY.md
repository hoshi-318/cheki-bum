# Vercelデプロイガイド

このガイドでは、Vercelを使用してアプリケーションをデプロイする手順を説明します。

## ステップ1: Vercelアカウントの作成

1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントでログイン（推奨）またはメールアドレスでアカウント作成

## ステップ2: プロジェクトの準備

### オプションA: GitHubリポジトリを使用（推奨）

1. **GitHubリポジトリを作成**
   ```bash
   cd /Users/hoshinokaori/Desktop/cheki-bum
   git init
   git add .
   git commit -m "Initial commit"
   # GitHubでリポジトリを作成してから
   git remote add origin https://github.com/yourusername/cheki-bum.git
   git push -u origin main
   ```

2. **Vercelでプロジェクトをインポート**
   - Vercelダッシュボードで「Add New...」→「Project」をクリック
   - 「Import Git Repository」を選択
   - GitHubリポジトリを選択
   - 「Import」をクリック

### オプションB: フォルダを直接アップロード

1. Vercel CLIをインストール（オプション）
   ```bash
   npm i -g vercel
   ```

2. プロジェクトフォルダで実行
   ```bash
   cd /Users/hoshinokaori/Desktop/cheki-bum
   vercel
   ```

## ステップ3: プロジェクト設定

Vercelのプロジェクト設定画面で以下を確認：

- **Framework Preset**: Other
- **Root Directory**: `./`（デフォルト）
- **Build Command**: （空欄のまま）
- **Output Directory**: `./`（デフォルト）
- **Install Command**: （空欄のまま）

## ステップ4: 環境変数の設定（オプション）

`config.js`をリポジトリに含めない場合は、環境変数を使用できます：

1. プロジェクト設定 → **Environment Variables**
2. 以下の環境変数を追加：
   - `VITE_CLOUDINARY_CLOUD_NAME` = `dacervm84`
   - `VITE_CLOUDINARY_UPLOAD_PRESET` = `cheki-bum-upload`
   - `VITE_SUPABASE_URL` = `https://hfpnjgwfhjtaiilankxw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**注意**: 環境変数を使用する場合は、`config.js`を環境変数から読み込むようにコードを修正する必要があります。

## ステップ5: デプロイ

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待機（通常1-2分）
3. デプロイ完了後、提供されたURLでアクセス

## ステップ6: 動作確認

デプロイ後、以下を確認してください：

1. ✅ 画像のアップロードが正常に動作するか
2. ✅ Supabaseへのデータ保存が正常に動作するか
3. ✅ 編集・削除機能が正常に動作するか
4. ✅ ブラウザのコンソールでエラーがないか確認

## トラブルシューティング

### エラー: "Cannot find module 'config.js'"

- `config.js`がリポジトリに含まれているか確認
- または、環境変数を使用するようにコードを修正

### エラー: "Cloudinary設定が不完全です"

- `config.js`が正しく読み込まれているか確認
- ブラウザのコンソールでエラーを確認

### 画像が表示されない

- CloudinaryのURLが正しいか確認
- CORS設定を確認

## カスタムドメインの設定（オプション）

1. プロジェクト設定 → **Domains**
2. カスタムドメインを追加
3. DNS設定を完了

## 自動デプロイ

GitHubリポジトリと連携している場合：
- `main`ブランチにプッシュすると自動的にデプロイされます
- プルリクエストごとにプレビューデプロイが作成されます

