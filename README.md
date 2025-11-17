# cheki-bum

写真管理アプリケーション

## Cloudinary設定

このアプリケーションはCloudinaryを使用して画像をアップロード・管理します。

### セットアップ手順

1. [Cloudinary](https://cloudinary.com/)でアカウントを作成
2. ダッシュボードから以下を取得：
   - Cloud Name
   - Upload Preset（Unsigned upload presetを作成）

3. `config.js`ファイルを編集して、取得した情報を設定：

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name', // Cloudinaryのクラウド名
  uploadPreset: 'your-upload-preset', // アップロードプリセット名
};
```

### Upload Presetの作成方法

1. Cloudinaryダッシュボードにログイン
2. Settings > Upload > Upload presets に移動
3. "Add upload preset" をクリック
4. "Signing mode" を "Unsigned" に設定
5. プリセット名を設定して保存

### 注意事項

- **削除機能について**: Unsigned upload presetを使用している場合、削除には署名が必要になることがあります。本番環境では、削除処理をサーバー側で実装することを推奨します。
- **セキュリティ**: `config.js`には機密情報を含めないでください。本番環境では環境変数を使用することを推奨します。

