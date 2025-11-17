# GitHub Webインターフェースからファイルをアップロードする手順

## ステップ1: GitHubリポジトリにアクセス

1. ブラウザで https://github.com/hoshi-318/cheki-bum にアクセス
2. リポジトリが空の場合は、ファイルをアップロードする画面が表示されます

## ステップ2: ファイルをアップロード

### 方法A: ドラッグ&ドロップ（最も簡単）

1. **「uploading an existing file」** または **「Add file」→「Upload files」** をクリック
2. ファイル選択画面が開きます
3. 以下のファイルをドラッグ&ドロップまたは選択：
   - `index.html`
   - `main.js`
   - `README.md`
   - `SETUP.md`
   - `SUPABASE_SETUP.md`
   - `ADD_COMMENT_COLUMN.md`
   - `DEPLOY.md`
   - `VERCEL_DEPLOY.md`
   - `.gitignore`
   - `netlify.toml`
   - `vercel.json`
   - `config.js`（⚠️ 注意: APIキーが含まれています）

4. ファイルをドラッグ&ドロップするか、「choose your files」をクリックして選択

### 方法B: 個別にファイルを作成

1. **「Add file」→「Create new file」** をクリック
2. ファイル名を入力（例: `index.html`）
3. ファイルの内容をコピー&ペースト
4. 「Commit new file」をクリック
5. 各ファイルについて繰り返す

## ステップ3: コミット

1. ファイルをアップロードした後、ページ下部の **「Commit changes」** セクションに移動
2. コミットメッセージを入力（例: "Initial commit"）
3. **「Commit changes」** ボタンをクリック

## ステップ4: 確認

1. リポジトリのページに戻り、ファイルが表示されているか確認
2. 以下のファイルが表示されていれば成功：
   - `index.html`
   - `main.js`
   - `config.js`
   - その他のファイル

## 注意事項

### config.jsについて

`config.js`にはAPIキーが含まれています：
- **Cloudinary**: `anonKey`は公開されても問題ありません
- **Supabase**: `anonKey`は公開されても問題ありませんが、`service_role`キーは絶対に公開しないでください

### プライベートリポジトリにする場合

1. リポジトリの **Settings** タブをクリック
2. 一番下の **「Change visibility」** セクションまでスクロール
3. **「Change visibility」** をクリック
4. **「Make private」** を選択

## 次のステップ

ファイルのアップロードが完了したら：

1. Vercelダッシュボードに戻る
2. 「Import Git Repository」をクリック
3. `hoshi-318/cheki-bum` を選択
4. デプロイを開始

