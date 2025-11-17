# デプロイガイド

このアプリケーションをデプロイする方法を説明します。

## デプロイ前の準備

### 1. config.jsの管理

`config.js`には機密情報（Cloudinary、Supabaseの設定）が含まれています。デプロイ時には以下のいずれかの方法を選択してください：

#### 方法A: config.jsをそのまま使用（簡易版）
- `config.js`をリポジトリに含める
- ⚠️ **注意**: APIキーが公開リポジトリに公開されます（anon keyは公開されても問題ありませんが、推奨されません）

#### 方法B: 環境変数を使用（推奨）
- デプロイ先の環境変数設定機能を使用
- `config.js`を`.gitignore`に追加してリポジトリから除外

## デプロイ方法

### 方法1: Netlify（推奨・最も簡単）

1. **Netlifyアカウント作成**
   - https://www.netlify.com/ にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトをデプロイ**
   - Netlifyダッシュボードで「Add new site」→「Deploy manually」
   - または、GitHubリポジトリを連携して自動デプロイ

3. **環境変数の設定（オプション）**
   - Site settings → Environment variables
   - 以下の変数を設定：
     - `VITE_CLOUDINARY_CLOUD_NAME`
     - `VITE_CLOUDINARY_UPLOAD_PRESET`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **デプロイ設定**
   - Build command: （不要）
   - Publish directory: `/`（ルートディレクトリ）

### 方法2: Vercel

1. **Vercelアカウント作成**
   - https://vercel.com/ にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトをインポート**
   - 「New Project」をクリック
   - GitHubリポジトリを選択
   - または、フォルダをドラッグ&ドロップ

3. **環境変数の設定（オプション）**
   - Project Settings → Environment Variables
   - 必要な環境変数を設定

4. **デプロイ**
   - 「Deploy」をクリック

### 方法3: GitHub Pages

1. **GitHubリポジトリを作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/cheki-bum.git
   git push -u origin main
   ```

2. **GitHub Pagesを有効化**
   - リポジトリのSettings → Pages
   - Source: `main`ブランチ、`/ (root)`を選択
   - Save

3. **config.jsの管理**
   - `config.js`をリポジトリに含める必要があります
   - または、GitHub Secretsを使用（ただし、静的サイトでは直接使用できません）

### 方法4: Cloudflare Pages

1. **Cloudflareアカウント作成**
   - https://pages.cloudflare.com/ にアクセス

2. **プロジェクトを接続**
   - 「Create a project」をクリック
   - GitHubリポジトリを接続

3. **ビルド設定**
   - Build command: （不要）
   - Build output directory: `/`

## デプロイ後の確認事項

1. **動作確認**
   - 画像のアップロードが正常に動作するか
   - Supabaseへのデータ保存が正常に動作するか
   - 編集・削除機能が正常に動作するか

2. **CORS設定**
   - CloudinaryとSupabaseのCORS設定が正しいか確認

3. **セキュリティ**
   - `config.js`に機密情報が含まれていないか確認
   - 必要に応じて環境変数を使用

## トラブルシューティング

### エラー: "Cloudinary設定が不完全です"
- `config.js`が正しく読み込まれているか確認
- 環境変数を使用している場合、変数名が正しいか確認

### エラー: "Supabase設定が未完了です"
- `config.js`が正しく読み込まれているか確認
- SupabaseのURLとキーが正しいか確認

### 画像が表示されない
- CloudinaryのURLが正しいか確認
- ブラウザのコンソールでエラーを確認

