// Cloudinary設定
// 
// 設定手順：
// 1. https://cloudinary.com/ でアカウントを作成
// 2. ダッシュボードの上部に表示されている「Cloud Name」を確認
// 3. Settings > Upload > Upload presets で新しいプリセットを作成
//    - Preset name: 任意の名前（例: cheki-bum-upload）
//    - Signing mode: "Unsigned" を選択（重要！）
// 4. 以下に取得した値を設定してください
//
const CLOUDINARY_CONFIG = {
  cloudName: 'dacervm84', 
  // ↑ 例: 'demo123' または 'my-cloud-name'
  // ダッシュボードの上部に表示されているCloud Nameを入力
  
  uploadPreset: 'cheki-bum-upload',
  // ↑ 例: 'cheki-bum-upload'
  // 作成したUpload Presetの名前を入力
};

// Supabase設定
// 
// 設定手順：
// 1. https://supabase.com/ でアカウントを作成
// 2. 新しいプロジェクトを作成
// 3. SQL Editorでphotosテーブルを作成（SUPABASE_SETUP.mdを参照）
// 4. Settings > API から以下を取得：
//    - Project URL
//    - anon/public key
// 5. 以下に取得した値を設定してください
//
const SUPABASE_CONFIG = {
  url: 'https://hfpnjgwfhjtaiilankxw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcG5qZ3dmaGp0YWlpbGFua3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODY1NDYsImV4cCI6MjA3ODk2MjU0Nn0.FfXshUogIIV51gANRRvXkRfYG1KS3KA_ZO8mdHQRntQ',
};

