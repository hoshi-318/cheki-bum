# Cloudinary設定ガイド

このガイドでは、Cloudinaryの設定を完了するための具体的な手順を説明します。

## ステップ1: Cloudinaryアカウントの作成

1. [Cloudinaryの公式サイト](https://cloudinary.com/)にアクセス
2. 「Sign Up」または「無料アカウントを作成」をクリック
3. メールアドレス、パスワード、名前を入力してアカウントを作成
4. メール認証を完了（メールボックスを確認）

## ステップ2: Cloud Nameの確認

1. Cloudinaryダッシュボードにログイン
2. ダッシュボードの上部に表示されている **Cloud Name** を確認
   - 例: `demo`、`my-cloud-name` など
   - これは自動的に生成された一意の名前です

## ステップ3: Upload Presetの作成

### 3-1. Upload Presetsページに移動

1. ダッシュボードの左側メニューから **Settings**（設定）をクリック
2. **Upload** タブをクリック
3. **Upload presets** セクションまでスクロール

### 3-2. 新しいUpload Presetを作成

1. **Add upload preset** ボタンをクリック
2. 以下の設定を行います：
   - **Preset name**: 任意の名前を入力（例: `cheki-bum-upload`）
   - **Signing mode**: **Unsigned** を選択（重要！）
   - **Folder**: （オプション）画像を保存するフォルダ名
   - **Allowed formats**: 画像形式を制限する場合は設定
3. **Save** ボタンをクリックして保存

### 3-3. Upload Preset名を確認

- 作成したプリセットの名前をメモしておきます
- これは後で`config.js`に設定します

## ステップ4: config.jsファイルの編集

プロジェクトの`config.js`ファイルを開き、以下のように編集します：

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name',        // ステップ2で確認したCloud Name
  uploadPreset: 'your-upload-preset',  // ステップ3で作成したPreset名
};
```

### 具体例

例えば、Cloud Nameが`demo123`で、Upload Preset名が`cheki-bum-upload`の場合：

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'demo123',
  uploadPreset: 'cheki-bum-upload',
};
```

## ステップ5: 動作確認

1. ブラウザで`index.html`を開く
2. 「追加」ボタン（右下の＋ボタン）をクリック
3. 画像を選択
4. タグを入力して「投稿」をクリック
5. 画像がアップロードされ、ギャラリーに表示されれば成功です

## トラブルシューティング

### エラー: "Cloudinary設定が不完全です"

- `config.js`の`cloudName`と`uploadPreset`が正しく設定されているか確認
- 値が文字列（シングルクォートまたはダブルクォートで囲まれているか）確認

### エラー: "アップロードに失敗しました"

- Upload Presetの「Signing mode」が「Unsigned」になっているか確認
- Cloud Nameが正しいか確認（大文字小文字も含めて）
- Upload Preset名が正しいか確認（スペースや特殊文字がないか）

### 画像が表示されない

- ブラウザのコンソール（F12キー）でエラーを確認
- Cloudinaryダッシュボードの「Media Library」で画像がアップロードされているか確認

## 補足情報

### Cloudinaryの無料プランについて

- 無料プランでも十分に使用できます
- 月25GBの転送量、25GBのストレージが利用可能
- 詳細は[料金ページ](https://cloudinary.com/pricing)を確認

### セキュリティについて

- `config.js`はGitにコミットしないでください（`.gitignore`に追加推奨）
- 本番環境では環境変数を使用することを推奨します

