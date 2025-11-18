const addButton = document.getElementById('add-button');
const imagePicker = document.getElementById('image-picker');
const gallery = document.querySelector('.gallery');
const mainScreen = document.getElementById('main-screen');
const postScreen = document.getElementById('post-screen');
const postScreenClose = document.getElementById('post-screen-close');
const tagInput = document.getElementById('tag-input');
const commentInput = document.getElementById('comment-input');
const postButton = document.getElementById('post-button');
const tabButtons = document.querySelectorAll('.tab-button');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const viewerModal = document.getElementById('viewer-modal');
const viewerImage = document.getElementById('viewer-image');
const viewerTag = document.getElementById('viewer-tag');
const viewerDate = document.getElementById('viewer-date');
const viewerComment = document.getElementById('viewer-comment');
const viewerUserName = document.getElementById('viewer-user-name');
const viewerClose = document.getElementById('viewer-close');
const viewerDelete = document.getElementById('viewer-delete');
const viewerEdit = document.getElementById('viewer-edit');
const viewerMenuButton = document.getElementById('viewer-menu-button');
const viewerMenuDropdown = document.getElementById('viewer-menu-dropdown');
const viewerMenu = document.getElementById('viewer-menu');
const tagFilter = document.getElementById('tag-filter');
const emptyState = document.getElementById('empty-state');
const editModal = document.getElementById('edit-modal');
const editTagInput = document.getElementById('edit-tag-input');
const editDateInput = document.getElementById('edit-date-input');
const editCommentInput = document.getElementById('edit-comment-input');
const editSaveButton = document.getElementById('edit-save-button');
const editModalClose = document.getElementById('edit-modal-close');
const displayNameElement = document.getElementById('display-name');
const displayNameModal = document.getElementById('display-name-modal');
const displayNameInput = document.getElementById('display-name-input');
const displayNameSaveButton = document.getElementById('display-name-save-button');
const loadingIndicator = document.getElementById('loading-indicator');
const userIconButton = document.getElementById('user-icon-button');
const profileModal = document.getElementById('profile-modal');
const profileModalClose = document.getElementById('profile-modal-close');
const profileDisplayNameInput = document.getElementById('profile-display-name-input');
const profileSaveButton = document.getElementById('profile-save-button');
const stampCanvas = document.getElementById('stamp-canvas');
const stampEditStep = document.getElementById('stamp-edit-step');
const previewStep = document.getElementById('preview-step');
const nextToPreviewButton = document.getElementById('next-to-preview-button');
const backToStampButton = document.getElementById('back-to-stamp-button');
const previewImage = document.getElementById('preview-image');

// スタンプ機能の変数
let originalImage = null;
let stampCtx = null;
let stamps = [];
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let canvasDrawWidth = 0;
let canvasDrawHeight = 0;
let canvasScaleX = 1;
let canvasScaleY = 1;
const STAMP_SIZE = 50;
let selectedStampIndex = -1;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let isResizing = false;
let initialDistance = 0;
let initialSize = 0;

// Supabaseクライアントの初期化
let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_CONFIG?.url && SUPABASE_CONFIG?.anonKey) {
  if (SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (error) {
      console.error('❌ Supabaseクライアント初期化エラー:', error);
    }
  }
}

const getUserKey = () => {
  let userKey = localStorage.getItem('cheki-bum-user-key');
  if (!userKey) {
    userKey = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cheki-bum-user-key', userKey);
  }
  return userKey;
};

// 削除トークンの生成
const generateDeleteToken = () => {
  return Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
};

const formatDateTime = (date) => {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDisplayName = async (targetUserKey = null) => {
  if (!supabaseClient) {
    return null;
  }

  try {
    const userKey = targetUserKey || getUserKey();
    const { data, error } = await supabaseClient
      .from('user_profiles')
      .select('display_name')
      .eq('user_key', userKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      console.error('表示名取得エラー:', error);
      return null;
    }

    return data?.display_name || null;
  } catch (error) {
    console.error('表示名取得に失敗しました:', error);
    return null;
  }
};

const saveDisplayName = async (displayName) => {
  if (!supabaseClient) {
    console.warn('Supabaseクライアントが初期化されていません');
    return false;
  }

  if (!displayName || !displayName.trim()) {
    alert('表示名を入力してください');
    return false;
  }

  try {
    const userKey = getUserKey();
    const trimmedName = displayName.trim();

    // 既存のレコードがあるか確認
    const { data: existingData } = await supabaseClient
      .from('user_profiles')
      .select('user_key')
      .eq('user_key', userKey)
      .single();

    if (existingData) {
      // 更新
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({ 
          display_name: trimmedName,
          updated_at: new Date().toISOString()
        })
        .eq('user_key', userKey);

      if (error) {
        console.error('表示名更新エラー:', error);
        throw error;
      }
    } else {
      // 新規作成
      const { error } = await supabaseClient
        .from('user_profiles')
        .insert([{
          user_key: userKey,
          display_name: trimmedName
        }]);

      if (error) {
        console.error('表示名保存エラー:', error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('表示名保存に失敗しました:', error);
    alert(`表示名の保存に失敗しました: ${error.message}`);
    return false;
  }
};

const updateDisplayNameUI = async (targetUserKey = null) => {
  if (!displayNameElement) return;

  // 表示名要素を非表示にする
  displayNameElement.style.display = 'none';
};

const parseRoute = () => {
  const path = window.location.pathname;
  const userMatch = path.match(/^\/user\/([^\/]+)$/);
  
  if (userMatch) {
    return {
      type: 'user',
      userKey: userMatch[1]
    };
  }
  
  return {
    type: 'home',
    userKey: null
  };
};

const updateUIForRoute = (route) => {
  const isUserPage = route.type === 'user';
  
  // タブを表示/非表示
  if (tabButtons && tabButtons.length > 0) {
    const tabsContainer = tabButtons[0].closest('nav.tabs');
    if (tabsContainer) {
      tabsContainer.style.display = isUserPage ? 'none' : 'flex';
    }
  }
  
  // 検索バーを表示/非表示
  const searchBar = document.querySelector('.search-bar');
  if (searchBar) {
    searchBar.style.display = isUserPage ? 'none' : 'block';
  }
  
  // タグフィルターを表示/非表示
  if (tagFilter) {
    tagFilter.style.display = isUserPage ? 'none' : '';
  }
  
  // 追加ボタン（FAB）を表示/非表示
  if (addButton) {
    addButton.style.display = isUserPage ? 'none' : 'flex';
  }
  
  // 戻るボタンを表示/非表示
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.style.display = isUserPage ? 'block' : 'none';
  }
  
  // 表示名のクリック可否を切り替え
  if (displayNameElement) {
    if (isUserPage) {
      displayNameElement.style.cursor = 'default';
      displayNameElement.title = '';
      displayNameElement.removeEventListener('click', openDisplayNameModal);
    } else {
      displayNameElement.style.cursor = 'pointer';
      displayNameElement.title = 'クリックして表示名を編集';
    }
  }
};

const openDisplayNameModal = () => {
  if (!displayNameModal || !displayNameInput) return;

  // プロフィールモーダルが開いていれば閉じる
  if (profileModal && profileModal.classList.contains('is-open')) {
    closeProfileModal();
  }

  displayNameInput.value = '';
  displayNameModal.classList.add('is-open');
  displayNameModal.setAttribute('aria-hidden', 'false');
  displayNameInput.focus();
};

const closeDisplayNameModal = () => {
  if (!displayNameModal) return;

  displayNameModal.classList.remove('is-open');
  displayNameModal.setAttribute('aria-hidden', 'true');
  if (displayNameInput) {
    displayNameInput.value = '';
  }
};

const openProfileModal = async () => {
  if (!profileModal || !profileDisplayNameInput) return;

  // 表示名モーダルが開いていれば閉じる
  if (displayNameModal && displayNameModal.classList.contains('is-open')) {
    closeDisplayNameModal();
  }

  // 現在のユーザーの表示名を取得
  const displayName = await getDisplayName();
  if (profileDisplayNameInput) {
    profileDisplayNameInput.value = displayName || '';
  }

  profileModal.classList.add('is-open');
  profileModal.setAttribute('aria-hidden', 'false');
  
  // 入力フィールドにフォーカス
  if (profileDisplayNameInput) {
    setTimeout(() => {
      profileDisplayNameInput.focus();
      profileDisplayNameInput.select();
    }, 100);
  }
};

const closeProfileModal = () => {
  if (!profileModal) return;

  profileModal.classList.remove('is-open');
  profileModal.setAttribute('aria-hidden', 'true');
};

const saveDisplayNameAndClose = async () => {
  if (!displayNameInput) return;

  const displayName = displayNameInput.value.trim();
  if (!displayName) {
    alert('表示名を入力してください');
    return;
  }

  const success = await saveDisplayName(displayName);
  if (success) {
    await updateDisplayNameUI();
    closeDisplayNameModal();
  }
};

const savePhotoToSupabase = async (photoData) => {
  if (!supabaseClient) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('photos')
      .insert([photoData])
      .select()
      .single();

    if (error) {
      console.error('Supabase保存エラー:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Supabase保存に失敗しました:', error);
    throw error;
  }
};

const loadPhotosFromSupabase = async (userKeyFilter = null, page = 0, limit = PHOTOS_PER_PAGE) => {
  if (!supabaseClient) {
    console.warn('Supabaseクライアントが初期化されていません');
    return [];
  }

  try {
    let query = supabaseClient
      .from('photos')
      .select('id, user_key, name_tag, comment, cloudinary_url, cloudinary_public_id, delete_token, created_at, updated_at');

    // 特定のユーザーの画像のみを取得する場合
    if (userKeyFilter) {
      query = query.eq('user_key', userKeyFilter);
    }

    // ページネーションを適用
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase読み込みエラー:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Supabase読み込みに失敗しました:', error);
    return [];
  }
};

const deletePhotoFromSupabase = async (photoId) => {
  if (!supabaseClient) {
    console.warn('Supabaseクライアントが初期化されていません');
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (error) {
      console.error('Supabase削除エラー:', error);
      throw error;
    }

  } catch (error) {
    console.error('Supabase削除に失敗しました:', error);
    throw error;
  }
};

const updatePhotoInSupabase = async (photoId, updateData) => {
  if (!supabaseClient) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('photos')
      .update(updateData)
      .eq('id', photoId)
      .select();

    if (error) {
      console.error('Supabase更新エラー:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('更新されたデータが見つかりません');
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Supabase更新に失敗しました:', error);
    throw error;
  }
};

let selectedFile = null;
let previewUrl = null;
let currentSearchQuery = '';
let currentTab = 'my';
let selectedTags = [];
let currentViewerIndex = -1;
let touchStartX = 0;
let touchMoveX = 0;
let currentRoute = null; // 現在のルート情報 { type: 'home' | 'user', userKey: string | null }

// 無限スクロール用の変数
const PHOTOS_PER_PAGE = 20;
let currentPage = 0;
let isLoading = false;
let hasMorePhotos = true;
let currentUserKeyFilter = null;
let intersectionObserver = null;

// 画像とスタンプを描画
const drawStampedImage = () => {
  const canvas = document.getElementById('stamp-canvas');
  if (!canvas || !originalImage) return;
  
  if (!stampCtx) {
    stampCtx = canvas.getContext('2d');
  }
  
  const ctx = stampCtx;
  
  // 表示サイズを取得
  const displayWidth = canvas.offsetWidth || canvas.clientWidth;
  const displayHeight = canvas.offsetHeight || canvas.clientHeight;
  
  if (displayWidth === 0 || displayHeight === 0) {
    console.warn('Canvasサイズが0です。再試行します...', { displayWidth, displayHeight });
    setTimeout(() => drawStampedImage(), 100);
    return;
  }
  
  // アスペクト比を維持して表示サイズを計算
  const imageAspect = originalImage.width / originalImage.height;
  const displayAspect = displayWidth / displayHeight;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (imageAspect > displayAspect) {
    // 画像が横長の場合
    drawWidth = displayWidth;
    drawHeight = displayWidth / imageAspect;
    offsetY = (displayHeight - drawHeight) / 2;
  } else {
    // 画像が縦長の場合
    drawHeight = displayHeight;
    drawWidth = displayHeight * imageAspect;
    offsetX = (displayWidth - drawWidth) / 2;
  }
  
  // Canvasの実際のサイズを設定（高解像度対応）
  const scale = window.devicePixelRatio || 1;
  canvas.width = displayWidth * scale;
  canvas.height = displayHeight * scale;
  ctx.scale(scale, scale);
  
  // 表示サイズと実際のサイズの比率を計算
  canvasScaleX = originalImage.width / drawWidth;
  canvasScaleY = originalImage.height / drawHeight;
  
  // オフセットと描画サイズをグローバル変数に保存
  canvasOffsetX = offsetX;
  canvasOffsetY = offsetY;
  canvasDrawWidth = drawWidth;
  canvasDrawHeight = drawHeight;
  
  // 背景をクリア
  ctx.fillStyle = '#f3f3f3';
  ctx.fillRect(0, 0, displayWidth, displayHeight);
  
  // 元の画像を描画
  ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight);
  
  // スタンプを描画
  stamps.forEach((stamp, index) => {
    // stamp.x, stamp.yはCanvas要素全体の座標系（表示サイズ）
    // ctx.scale(scale, scale)により、描画座標は表示サイズの座標系で直接使用可能
    // スタンプは画像上に描画するため、画像の描画位置（offsetX, offsetY）を考慮
    // しかし、スタンプの位置は画像座標に変換する必要がある
    
    // 表示座標から画像座標への変換
    // 1. 画像の描画位置を考慮（offsetX, offsetYを引く）
    // 2. 画像のスケールを考慮（canvasScaleX, canvasScaleYを掛ける）
    // 3. 画像座標を表示座標に戻す（canvasScaleX, canvasScaleYで割る）
    // しかし、これは複雑なので、直接表示座標で描画する
    
    // スタンプの位置は表示座標系で保存されている
    // 画像上に描画するには、画像の描画位置を考慮する必要がある
    // しかし、ctx.scale()により、表示座標系で直接描画できる
    
    // 表示座標系で直接描画（画像の描画位置は既に考慮されている）
    const x = stamp.x; // 表示座標系
    const y = stamp.y; // 表示座標系
    const size = stamp.size; // 表示サイズ
    
    // 選択状態の場合は枠線を描画
    if (index === selectedStampIndex) {
      ctx.strokeStyle = '#3b82f6'; // 青い枠線
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, size / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      
      const deleteButtonSize = 20;
      const deleteButtonX = x + size / 2 - deleteButtonSize / 2;
      const deleteButtonY = y - size / 2 - deleteButtonSize / 2;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(deleteButtonX + deleteButtonSize / 2, deleteButtonY + deleteButtonSize / 2, deleteButtonSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const crossSize = deleteButtonSize * 0.4;
      ctx.moveTo(deleteButtonX + deleteButtonSize / 2 - crossSize / 2, deleteButtonY + deleteButtonSize / 2 - crossSize / 2);
      ctx.lineTo(deleteButtonX + deleteButtonSize / 2 + crossSize / 2, deleteButtonY + deleteButtonSize / 2 + crossSize / 2);
      ctx.moveTo(deleteButtonX + deleteButtonSize / 2 + crossSize / 2, deleteButtonY + deleteButtonSize / 2 - crossSize / 2);
      ctx.lineTo(deleteButtonX + deleteButtonSize / 2 - crossSize / 2, deleteButtonY + deleteButtonSize / 2 + crossSize / 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#F1F1F1';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

// スタンプをクリア
const clearStamps = () => {
  stamps = [];
  selectedStampIndex = -1;
  if (originalImage) {
    drawStampedImage();
  }
};

// 選択されたスタンプを削除
const deleteSelectedStamp = () => {
  if (selectedStampIndex >= 0 && selectedStampIndex < stamps.length) {
    stamps.splice(selectedStampIndex, 1);
    selectedStampIndex = -1;
    if (originalImage) {
      drawStampedImage();
    }
  }
};

// クリック/タップ位置にあるスタンプのインデックスを取得
const getStampAtPosition = (x, y) => {
  const canvas = document.getElementById('stamp-canvas');
  if (!canvas || !originalImage) return -1;
  
  // drawStampedImage()が呼ばれていない場合は、先に呼び出して値を設定
  if (canvasDrawWidth === 0) {
    drawStampedImage();
  }
  
  // クリック位置が画像範囲内かチェック
  if (x < canvasOffsetX || x > canvasOffsetX + canvasDrawWidth || 
      y < canvasOffsetY || y > canvasOffsetY + canvasDrawHeight) {
    return -1;
  }
  
  // 各スタンプとの距離をチェック（後ろから順にチェックして、上に重なっているものを優先）
  // stamp.x, stamp.yはCanvas要素全体の座標系なので、そのまま比較
  for (let i = stamps.length - 1; i >= 0; i--) {
    const stamp = stamps[i];
    const dx = x - stamp.x;
    const dy = y - stamp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = stamp.size / 2;
    
    if (distance <= radius) {
      return i;
    }
  }
  
  return -1;
};

// 2点間の距離を計算
const getDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

// Canvasから画像Blobを取得
const getStampedImageBlob = () => {
  return new Promise((resolve, reject) => {
    const canvas = document.getElementById('stamp-canvas');
    if (!canvas || !originalImage) {
      console.warn('getStampedImageBlob: canvasまたはoriginalImageが存在しません');
      resolve(null);
      return;
    }
    
    try {
      // drawStampedImage()が呼ばれていない場合は、先に呼び出して値を設定
      if (canvasScaleX === 1 && canvasScaleY === 1 && canvasDrawWidth === 0) {
          drawStampedImage();
      }
      
      const offsetX = canvasOffsetX;
      const offsetY = canvasOffsetY;
      const scaleX = canvasScaleX;
      const scaleY = canvasScaleY;
      
      // 元の画像サイズでCanvasを作成
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalImage.width;
      tempCanvas.height = originalImage.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // 元の画像を描画
      tempCtx.drawImage(originalImage, 0, 0);
      
      // スタンプを描画
      stamps.forEach((stamp, index) => {
        // drawStampedImage()と同じ座標変換を使用
        // stamp.x, stamp.yはCanvasの表示座標（offsetX/offsetYを考慮）
        // これを元の画像座標に変換
        const x = (stamp.x - offsetX) * scaleX;
        const y = (stamp.y - offsetY) * scaleY;
        const size = stamp.size * scaleX;
        
        // 有効な値かチェック
        if (!isFinite(x) || !isFinite(y) || !isFinite(size)) {
          console.error(`スタンプ ${index + 1} の座標が無効です`, { x, y, size, stamp, offsetX, offsetY, scaleX, scaleY });
          return;
        }
        
        // 画像範囲内かチェック
        if (x < 0 || x > originalImage.width || y < 0 || y > originalImage.height) {
          console.warn(`スタンプ ${index + 1} が画像範囲外です`, { x, y, imageSize: { width: originalImage.width, height: originalImage.height } });
        }
        
        // サイズが0以下の場合はスキップ
        if (size <= 0) {
          console.warn(`スタンプ ${index + 1} のサイズが0以下です`, { size, displaySize: stamp.size, scaleX });
          return;
        }
        
        // 円形スタンプを描画
        tempCtx.fillStyle = '#F1F1F1'; // ライトグレー
        tempCtx.beginPath();
        tempCtx.arc(x, y, size / 2, 0, Math.PI * 2);
        tempCtx.fill();
      });
      
      tempCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Blobの生成に失敗しました'));
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('getStampedImageBlob エラー:', error);
      reject(error);
    }
  });
};

// ステップ1（スタンプ編集）を表示
const showStampEditStep = () => {
  if (stampEditStep) stampEditStep.style.display = 'flex';
  if (previewStep) previewStep.style.display = 'none';
};

// ステップ2（プレビュー・投稿）を表示
const showPreviewStep = async () => {
  if (stampEditStep) stampEditStep.style.display = 'none';
  if (previewStep) previewStep.style.display = 'flex';
  
  // スタンプ付き画像をプレビューに表示
  if (previewImage && originalImage) {
    try {
      const blob = await getStampedImageBlob();
      if (blob) {
        const url = URL.createObjectURL(blob);
        previewImage.src = url;
        // 以前のURLをクリーンアップ
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        previewUrl = url;
      } else {
        console.warn('スタンプ付き画像のBlobが取得できませんでした');
        // Blobが取得できない場合は元の画像を表示
        if (originalImage.src) {
          previewImage.src = originalImage.src;
        }
      }
    } catch (error) {
      console.error('プレビュー画像の生成エラー:', error);
      // エラーが発生した場合は元の画像を表示
      if (originalImage.src) {
        previewImage.src = originalImage.src;
      }
    }
  }
  
  // タグ入力にフォーカス
  if (tagInput) {
    tagInput.focus();
  }
};

const openPostScreen = (file) => {
  if (!postScreen || !mainScreen) return;
  const stampCanvas = document.getElementById('stamp-canvas');
  if (!stampCanvas) {
    console.error('stampCanvasが見つかりません');
    return;
  }

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  // スタンプをリセット
  stamps = [];
  selectedStampIndex = -1;
  isDragging = false;
  isResizing = false;

  // 画面遷移
  mainScreen.style.display = 'none';
  postScreen.style.display = 'block';

  // ステップ1を表示
  showStampEditStep();

  // 画像を読み込んでCanvasに描画
  const reader = new FileReader();
  reader.onload = (e) => {
    originalImage = new Image();
    originalImage.onload = () => {
      const canvas = document.getElementById('stamp-canvas');
      if (canvas && !stampCtx) {
        stampCtx = canvas.getContext('2d');
      }
      // 画面表示後に少し遅延させてから描画（Canvasサイズが正しく取得できるように）
      setTimeout(() => {
        drawStampedImage();
      }, 100);
    };
    originalImage.onerror = () => {
      console.error('画像読み込みエラー');
    };
    originalImage.src = e.target.result;
  };
  reader.onerror = () => {
    console.error('FileReaderエラー');
  };
  reader.readAsDataURL(file);

  selectedFile = file;
  
  // タグとコメントをクリア
  if (tagInput) {
    tagInput.value = '';
  }
  if (commentInput) {
    commentInput.value = '';
  }
};

const closePostScreen = () => {
  if (!postScreen || !mainScreen) return;

  // 画面遷移
  postScreen.style.display = 'none';
  mainScreen.style.display = 'block';

  // スタンプをリセット
  stamps = [];
  selectedStampIndex = -1;
  isDragging = false;
  isResizing = false;
  originalImage = null;

  // ステップ1に戻す
  showStampEditStep();

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  selectedFile = null;
  if (tagInput) {
    tagInput.value = '';
  }
  if (commentInput) {
    commentInput.value = '';
  }
  if (imagePicker) {
    imagePicker.value = '';
  }
};

const getGalleryImages = () => {
  if (!gallery) return [];
  return Array.from(gallery.querySelectorAll('img'));
};

const getVisibleGalleryImages = () => {
  if (!gallery) return [];
  // 表示されている画像のみを取得（display: none でないもの）
  return Array.from(gallery.querySelectorAll('img')).filter(
    (img) => img.style.display !== 'none'
  );
};

const showViewerImageAt = (index, openIfNeeded = true) => {
  if (!viewerModal || !viewerImage || !viewerTag || !viewerDate) return;
  // 表示されている画像のみを対象にする
  const images = getVisibleGalleryImages();
  if (!images.length) return;

  const normalizedIndex =
    ((index % images.length) + images.length) % images.length;
  const img = images[normalizedIndex];
  if (!img) return;

  viewerImage.src = img.src;
  viewerImage.alt = img.alt || '選択中の画像';
  const tagText = img.dataset.tag?.trim() || '';
  viewerTag.textContent = tagText;
  // タグが空の場合は非表示
  if (!tagText) {
    viewerTag.style.display = 'none';
  } else {
    viewerTag.style.display = '';
  }
  // 日付のみを表示（時刻は表示しない）
  const dateValue = img.dataset.date;
  if (dateValue && dateValue !== '-') {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        // 日付のみをフォーマット（YYYY/MM/DD形式）
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        viewerDate.textContent = `${year}/${month}/${day}`;
      } else {
        viewerDate.textContent = dateValue;
      }
    } catch (e) {
      viewerDate.textContent = dateValue;
    }
  } else {
    viewerDate.textContent = '-';
  }
  // コメントを表示
  if (viewerComment) {
    const comment = img.dataset.comment?.trim() || '';
    viewerComment.textContent = comment;
    // コメントが空の場合は非表示
    if (!comment) {
      viewerComment.style.display = 'none';
    } else {
      viewerComment.style.display = '';
    }
  }
  
  // ユーザー名を表示
  if (viewerUserName) {
    const userKey = img.dataset.userKey;
    if (userKey) {
      getDisplayName(userKey).then((displayName) => {
        if (displayName) {
          viewerUserName.textContent = `投稿者：${displayName}`;
          viewerUserName.style.display = '';
        } else {
          viewerUserName.textContent = '';
          viewerUserName.style.display = 'none';
        }
      });
    } else {
      viewerUserName.textContent = '';
      viewerUserName.style.display = 'none';
    }
  }
  
  currentViewerIndex = normalizedIndex;

  // 3点リーダーメニューボタンの表示/非表示を制御
  // 公開アルバムページ（/user/{user_key}）ではメニューボタンを非表示
  const isUserPage = currentRoute && currentRoute.type === 'user';
  const isMyPhoto = img.dataset.owner === 'my' && !isUserPage;
  
  if (viewerMenuButton) {
    if (isMyPhoto) {
      viewerMenuButton.classList.add('is-visible');
      viewerMenuButton.dataset.imageIndex = normalizedIndex;
    } else {
      viewerMenuButton.classList.remove('is-visible');
      delete viewerMenuButton.dataset.imageIndex;
      // メニューが開いていたら閉じる
      if (viewerMenuDropdown) {
        viewerMenuDropdown.classList.remove('is-open');
      }
    }
  }

  if (openIfNeeded || !viewerModal.classList.contains('is-open')) {
    viewerModal.classList.add('is-open');
    viewerModal.setAttribute('aria-hidden', 'false');
  }
};

const openViewer = (img) => {
  // 表示されている画像のみを対象にする
  const images = getVisibleGalleryImages();
  const index = images.indexOf(img);
  if (index === -1) return;
  showViewerImageAt(index);
};

const showNextViewerImage = () => {
  if (currentViewerIndex === -1) return;
  showViewerImageAt(currentViewerIndex + 1, false);
};

const showPreviousViewerImage = () => {
  if (currentViewerIndex === -1) return;
  showViewerImageAt(currentViewerIndex - 1, false);
};

const closeViewer = () => {
  if (!viewerModal || !viewerImage) return;

  // フォーカスを外してから閉じる（aria-hiddenの警告を回避）
  if (document.activeElement && viewerModal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  viewerModal.classList.remove('is-open');
  viewerModal.setAttribute('aria-hidden', 'true');

  viewerImage.src = '';
  viewerImage.alt = '選択中の画像';
  if (viewerComment) {
    viewerComment.textContent = '';
  }
  if (viewerUserName) {
    viewerUserName.textContent = '';
    viewerUserName.style.display = 'none';
  }
  currentViewerIndex = -1;

  if (viewerMenuButton) {
    viewerMenuButton.classList.remove('is-visible');
    delete viewerMenuButton.dataset.imageIndex;
  }
  if (viewerMenuDropdown) {
    viewerMenuDropdown.classList.remove('is-open');
  }
};

const deleteCurrentImage = async () => {
  if (currentViewerIndex === -1 || !gallery) return;

  // 表示されている画像のみを対象にする
  const images = getVisibleGalleryImages();
  if (currentViewerIndex >= images.length) return;

  const imgToDelete = images[currentViewerIndex];
  // 自分の投稿でない場合は削除できない
  if (!imgToDelete || imgToDelete.dataset.owner !== 'my') {
    console.warn('削除権限がありません: 自分の投稿ではありません');
    return;
  }

  const publicId = imgToDelete.dataset.publicId;
  const photoId = imgToDelete.dataset.photoId;

  // 確認ダイアログ
  if (!confirm('この画像を削除しますか？')) {
    return;
  }

  try {
    // Supabaseから削除（photoIdがある場合）
    if (photoId && supabaseClient) {
      try {
        await deletePhotoFromSupabase(photoId);
      } catch (error) {
        console.warn('Supabaseからの削除に失敗しました:', error);
        // Supabaseからの削除に失敗しても続行
      }
    }

    // 注意: Cloudinaryからの削除はCORS制限によりクライアント側から実行できません
    // 画像ファイルはCloudinaryに残りますが、メタデータはSupabaseから削除されます
    // 必要に応じて、サーバー側でCloudinaryの削除を実行してください

    // 画像を削除
    imgToDelete.remove();

    // ビューモーダルを閉じる（フォーカスを外してから閉じる）
    if (document.activeElement) {
      document.activeElement.blur();
    }
    closeViewer();

    // タグフィルターを更新
    renderTagFilter();

    // ギャラリーを再フィルタリング
    filterGallery();
  } catch (error) {
    console.error('画像の削除に失敗しました', error);
    alert(`画像の削除に失敗しました: ${error.message}`);
  }
};

const attachImageClick = (img) => {
  if (!img) return;
  img.addEventListener('click', () => openViewer(img));
};

const openEditModal = async () => {
  if (currentViewerIndex === -1 || !gallery || !editModal) return;

  const images = getVisibleGalleryImages();
  if (currentViewerIndex >= images.length) return;

  const img = images[currentViewerIndex];
  if (!img || img.dataset.owner !== 'my') {
    alert('自分の投稿のみ編集できます');
    return;
  }
  
  const photoId = img.dataset.photoId;
  if (!photoId) {
    setEditModalValues(img);
    return;
  }

  // Supabaseから最新のデータを取得
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('photos')
        .select('name_tag, comment, created_at')
        .eq('id', photoId)
        .single();

      if (error) {
        console.error('Supabaseからデータ取得エラー:', error);
        // エラー時はDOMの値を使用
        setEditModalValues(img);
        return;
      }

      if (editTagInput) {
        editTagInput.value = data.name_tag || '';
      }
      if (editCommentInput) {
        editCommentInput.value = data.comment || '';
      }
      if (editDateInput) {
        const dateStr = data.created_at;
        if (dateStr) {
          try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            editDateInput.value = `${year}-${month}-${day}`;
            } else {
              editDateInput.value = '';
            }
          } catch (e) {
            editDateInput.value = '';
          }
        } else {
          editDateInput.value = '';
        }
      }
    } catch (error) {
      console.error('Supabaseからデータ取得に失敗:', error);
      // エラー時はDOMの値を使用
      setEditModalValues(img);
    }
  } else {
    // Supabaseが設定されていない場合はDOMの値を使用
    setEditModalValues(img);
  }

  editModal.classList.add('is-open');
  editModal.setAttribute('aria-hidden', 'false');
  
  if (editTagInput) {
    editTagInput.focus();
  }
};

const setEditModalValues = (img) => {
  // DOMの値を使用して編集モーダルに設定
  if (editTagInput) {
    editTagInput.value = img.dataset.tag || '';
  }
  if (editCommentInput) {
    editCommentInput.value = img.dataset.comment || '';
  }
  if (editDateInput) {
    const dateStr = img.dataset.date || '';
    if (dateStr && dateStr !== '-') {
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            editDateInput.value = `${year}-${month}-${day}`;
        } else {
          editDateInput.value = '';
        }
      } catch (e) {
        editDateInput.value = '';
      }
    } else {
      editDateInput.value = '';
    }
  }
};

const closeEditModal = () => {
  if (!editModal) return;
  editModal.classList.remove('is-open');
  editModal.setAttribute('aria-hidden', 'true');
  if (editTagInput) {
    editTagInput.value = '';
  }
  if (editCommentInput) {
    editCommentInput.value = '';
  }
  if (editDateInput) {
    editDateInput.value = '';
  }
};

const saveEdit = async () => {
  if (currentViewerIndex === -1 || !gallery) return;

  // 表示されている画像のみを対象にする
  const images = getVisibleGalleryImages();
  if (currentViewerIndex >= images.length) return;

  const img = images[currentViewerIndex];
  // 自分の投稿でない場合は保存できない
  if (!img || img.dataset.owner !== 'my') {
    console.warn('保存権限がありません: 自分の投稿ではありません');
    alert('自分の投稿のみ編集できます');
    return;
  }

  const photoId = img.dataset.photoId;
  if (!photoId) {
    alert('編集対象の画像が見つかりません');
    return;
  }

  const newTag = editTagInput?.value?.trim() || '';
  const newComment = editCommentInput?.value?.trim() || '';
  const newDateStr = editDateInput?.value || '';

  if (!newTag) {
    alert('タグを入力してください');
    return;
  }

  // 保存ボタンを無効化
  const originalText = editSaveButton?.textContent;
  if (editSaveButton) {
    editSaveButton.disabled = true;
    editSaveButton.textContent = '保存中...';
  }

  try {
    // 日時をISO形式に変換
    let newDateISO = null;
    if (newDateStr) {
      const date = new Date(newDateStr);
      if (!isNaN(date.getTime())) {
        newDateISO = date.toISOString();
      }
    }

    // Supabaseを更新
    const updateData = {
      name_tag: newTag,
      comment: newComment || null, // 空文字列の場合はnullに変換
    };
    if (newDateISO) {
      updateData.created_at = newDateISO;
    }

    let updatedData = null;
    if (supabaseClient) {
      try {
        updatedData = await updatePhotoInSupabase(photoId, updateData);
      } catch (error) {
        console.error('❌ Supabase更新エラー:', error);
        alert(`データの更新に失敗しました: ${error.message}\n\nSupabaseのRLSポリシーでUPDATEが許可されているか確認してください。`);
        throw error;
      }
    }

    // Supabaseから取得した最新データで画像要素を更新（Supabaseが更新に成功した場合）
    if (updatedData) {
      img.dataset.tag = updatedData.name_tag || '';
      img.dataset.comment = updatedData.comment || '';
      if (updatedData.created_at) {
        img.dataset.date = formatDateTime(updatedData.created_at);
      }
      img.alt = updatedData.name_tag || '投稿された画像';
    } else {
      // Supabaseが更新されなかった場合は、入力値をそのまま使用
      img.dataset.tag = newTag;
      img.dataset.comment = newComment;
      if (newDateISO) {
        img.dataset.date = formatDateTime(newDateISO);
      } else {
        img.dataset.date = img.dataset.date || '-';
      }
      img.alt = newTag || '投稿された画像';
    }

    // ビューモーダルの表示を更新
    if (viewerTag) {
      viewerTag.textContent = img.dataset.tag || '';
    }
    if (viewerComment) {
      viewerComment.textContent = img.dataset.comment || '';
    }
    if (viewerDate) {
      viewerDate.textContent = img.dataset.date;
    }

    // 編集モーダルを閉じる
    closeEditModal();

    // タグフィルターとフィルタリングを更新
    renderTagFilter();
    filterGallery();
  } catch (error) {
    console.error('編集の保存に失敗しました', error);
    alert(`編集の保存に失敗しました: ${error.message}`);
  } finally {
    if (editSaveButton) {
      editSaveButton.disabled = false;
      editSaveButton.textContent = originalText;
    }
  }
};

const createImageElement = (photoData) => {
  const img = document.createElement('img');
  img.alt = photoData.name_tag || '投稿された画像';
  img.src = photoData.cloudinary_url;
  img.dataset.tag = photoData.name_tag || '';
  // コメントを保存（nullの場合は空文字列に変換）
  img.dataset.comment = photoData.comment || '';
  img.dataset.date = formatDateTime(photoData.created_at);
  img.dataset.owner = photoData.user_key === getUserKey() ? 'my' : 'all';
  img.dataset.userKey = photoData.user_key || ''; // user_keyを保存
  img.dataset.publicId = photoData.cloudinary_public_id || '';
  if (photoData.id) {
    img.dataset.photoId = photoData.id;
  }
  if (photoData.delete_token) {
    img.dataset.deleteToken = photoData.delete_token;
  }
  attachImageClick(img);
  return img;
};

const loadPhotosFromDatabase = async (userKeyFilter = null, reset = true) => {
  if (!supabaseClient || isLoading) return;

  isLoading = true;
  currentUserKeyFilter = userKeyFilter;

  // ローディングインジケーターを表示
  if (loadingIndicator) {
    loadingIndicator.classList.add('is-visible');
  }

  try {
    // リセットの場合は既存の画像をクリア
    if (reset) {
      currentPage = 0;
      hasMorePhotos = true;
      
      const existingImages = gallery.querySelectorAll('img');
      existingImages.forEach((img) => {
        // サンプル画像（data-owner="all"でdata-photo-idがないもの）は残す
        if (img.dataset.owner === 'all' && !img.dataset.photoId) {
          return;
        }
        img.remove();
      });
    }

    const photos = await loadPhotosFromSupabase(userKeyFilter, currentPage, PHOTOS_PER_PAGE);
    
    if (photos.length === 0) {
      hasMorePhotos = false;
      if (loadingIndicator) {
        loadingIndicator.classList.remove('is-visible');
      }
      isLoading = false;
      
      // 空の状態メッセージを表示（初期読み込み時のみ）
      if (reset && emptyState && gallery) {
        const images = gallery.querySelectorAll('img');
        if (images.length === 0) {
          emptyState.classList.add('is-visible');
          gallery.style.display = 'none';
        }
      }
      return;
    }

    // 取得した画像数がページサイズより少ない場合は、これ以上読み込む画像がない
    if (photos.length < PHOTOS_PER_PAGE) {
      hasMorePhotos = false;
    }

    // Supabaseから取得した画像を追加
    photos.forEach((photo) => {
      const img = createImageElement(photo);
      gallery.appendChild(img); // 新着順で表示（降順で取得しているので、appendChildで正しい順序になる）
    });

    currentPage++;

    // タグフィルターとフィルタリングを更新（ホームページの場合のみ）
    if (!userKeyFilter) {
      renderTagFilter();
      filterGallery();
    } else {
      // ユーザーページの場合は全て表示
      Array.from(gallery.querySelectorAll('img')).forEach((img) => {
        img.style.display = '';
      });
    }

    // IntersectionObserverを設定（初回読み込み時のみ）
    if (reset && hasMorePhotos) {
      setupIntersectionObserver();
    }
  } catch (error) {
    console.error('データベースからの読み込みに失敗しました:', error);
  } finally {
    isLoading = false;
    if (loadingIndicator) {
      loadingIndicator.classList.remove('is-visible');
    }
  }
};

// IntersectionObserverを設定
const setupIntersectionObserver = () => {
  if (!loadingIndicator) return;

  // 既存のObserverを破棄
  if (intersectionObserver) {
    intersectionObserver.disconnect();
  }

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMorePhotos && !isLoading) {
          // 追加の画像を読み込む
          loadPhotosFromDatabase(currentUserKeyFilter, false);
        }
      });
    },
    {
      rootMargin: '100px', // 100px手前で読み込み開始
    }
  );

  intersectionObserver.observe(loadingIndicator);
};

const filterGallery = () => {
  if (!gallery) return;
  const normalized = currentSearchQuery.trim().toLowerCase();

  let visibleCount = 0;
  Array.from(gallery.querySelectorAll('img')).forEach((img) => {
    const tag = img.dataset.tag?.toLowerCase() ?? '';
    const owner = img.dataset.owner || 'all';
    const matchesSearch = !normalized || tag.includes(normalized);
    const matchesTab = currentTab === 'all' ? true : owner === 'my';
    const matchesTagFilter =
      currentTab !== 'my' ||
      !selectedTags.length ||
      selectedTags.some((selectedTag) => tag === selectedTag.toLowerCase());

    const isVisible = matchesSearch && matchesTab && matchesTagFilter;
    img.style.display = isVisible ? '' : 'none';
    if (isVisible) {
      visibleCount++;
    }
  });

  // 空の状態メッセージの表示/非表示を制御
  if (emptyState) {
    if (currentTab === 'my' && visibleCount === 0) {
      emptyState.classList.add('is-visible');
      if (gallery) {
        gallery.style.display = 'none';
      }
    } else {
      emptyState.classList.remove('is-visible');
      if (gallery) {
        gallery.style.display = 'grid';
      }
    }
  }
};


const collectMyPhotosTags = () => {
  if (!gallery) return [];
  const tags = new Set();
  Array.from(gallery.querySelectorAll('img')).forEach((img) => {
    if (img.dataset.owner === 'my') {
      const tag = img.dataset.tag?.trim();
      if (tag) {
        tags.add(tag);
      }
    }
  });
  return Array.from(tags).sort();
};

const renderTagFilter = () => {
  if (!tagFilter) return;
  tagFilter.innerHTML = '';

  if (currentTab !== 'my') {
    tagFilter.classList.remove('is-visible');
    return;
  }

  const tags = collectMyPhotosTags();
  if (!tags.length) {
    tagFilter.classList.remove('is-visible');
    return;
  }

  tags.forEach((tag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tag-filter-button';
    button.textContent = tag;
    const isActive = selectedTags.includes(tag.toLowerCase());
    if (isActive) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      const normalized = tag.toLowerCase();
      if (selectedTags.includes(normalized)) {
        selectedTags = selectedTags.filter((t) => t !== normalized);
      } else {
        selectedTags.push(normalized);
      }
      renderTagFilter();
      filterGallery();
    });

    tagFilter.appendChild(button);
  });

  tagFilter.classList.add('is-visible');
};

const setActiveTab = (tab) => {
  if (!tabButtons?.length) return;
  currentTab = tab;
  selectedTags = [];

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  // 検索窓の表示/非表示を制御
  const searchBar = document.querySelector('.search-bar');
  if (searchBar) {
    // 「じぶん」タブの場合は検索窓を非表示、「みんな」タブの場合は表示
    const isHomePage = !currentRoute || currentRoute.type === 'home';
    if (isHomePage && tab === 'my') {
      searchBar.style.display = 'none';
      // 検索クエリをクリア
      if (searchInput) {
        searchInput.value = '';
        currentSearchQuery = '';
      }
    } else if (isHomePage && tab === 'all') {
      searchBar.style.display = 'flex';
    }
  }

  renderTagFilter();
  filterGallery();
  
  // タブ切り替え時に表示名を更新
  const isHomePage = !currentRoute || currentRoute.type === 'home';
  if (isHomePage) {
    updateDisplayNameUI();
  }
};

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      reject(new Error('Cloudinary設定が不完全です。config.jsを確認してください。'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, true);

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          publicId: response.public_id,
        });
      } else {
        reject(new Error(`アップロードに失敗しました: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('ネットワークエラーが発生しました'));
    };

    xhr.send(formData);
  });
};


if (
  addButton &&
  imagePicker &&
  gallery &&
  mainScreen &&
  postScreen &&
  tagInput &&
  postButton &&
  tabButtons.length &&
  searchInput &&
  searchClear &&
  viewerModal &&
  viewerImage &&
  viewerTag &&
  viewerDate &&
  viewerClose &&
  stampEditStep &&
  previewStep
) {
  addButton.addEventListener('click', () => {
    imagePicker.click();
  });

  imagePicker.addEventListener('change', () => {
    const [file] = Array.from(imagePicker.files ?? []);
    if (!file || !file.type.startsWith('image/')) {
      imagePicker.value = '';
      return;
    }

    openPostScreen(file);
  });

  // Canvas上でのスタンプ操作（クリック/タップ、ドラッグ、ピンチズーム）
  const canvas = document.getElementById('stamp-canvas');
  if (canvas) {
    // マウス/タッチ開始
    const handleStart = (e) => {
      if (postScreen && postScreen.style.display === 'none') return;
      if (e.target !== canvas) return;
      
      e.stopPropagation();
      // cancelableな場合のみpreventDefaultを呼び出す
      if (e.cancelable) {
        e.preventDefault();
      }
      
      if (!originalImage) return;
      
      // drawStampedImage()を先に呼び出して、offsetX/Yを確実に設定
      if (canvasDrawWidth === 0) {
        drawStampedImage();
      }
      
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      // 画像範囲内かチェック
      if (x < canvasOffsetX || x > canvasOffsetX + canvasDrawWidth || 
          y < canvasOffsetY || y > canvasOffsetY + canvasDrawHeight) {
        // 画像範囲外のクリックは無視
        return;
      }
      
      // 選択されたスタンプの「×」ボタンをクリックしたかチェック
      if (selectedStampIndex >= 0 && selectedStampIndex < stamps.length) {
        const selectedStamp = stamps[selectedStampIndex];
        const deleteButtonSize = 20;
        const deleteButtonX = selectedStamp.x + selectedStamp.size / 2 - deleteButtonSize / 2;
        const deleteButtonY = selectedStamp.y - selectedStamp.size / 2 - deleteButtonSize / 2;
        const deleteButtonCenterX = deleteButtonX + deleteButtonSize / 2;
        const deleteButtonCenterY = deleteButtonY + deleteButtonSize / 2;
        
        // 「×」ボタンをクリックしたかチェック
        const dx = x - deleteButtonCenterX;
        const dy = y - deleteButtonCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= deleteButtonSize / 2) {
          // 「×」ボタンをクリックした場合は削除
          deleteSelectedStamp();
          return;
        }
      }
      
      // 既存のスタンプをクリックしたかチェック
      const stampIndex = getStampAtPosition(x, y);
      
      if (stampIndex >= 0) {
        // スタンプ本体をクリックした場合は選択
        selectedStampIndex = stampIndex;
        isDragging = true;
        dragStartX = x;
        dragStartY = y;
        drawStampedImage();
      } else {
        // 空いている場所をクリックした場合は選択を解除
        selectedStampIndex = -1;
        drawStampedImage();
        
        if (e.touches && e.touches.length === 2) {
        // 2本指の場合はピンチズーム（サイズ変更）
        if (selectedStampIndex >= 0) {
          isResizing = true;
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          initialDistance = getDistance(
            touch1.clientX, touch1.clientY,
            touch2.clientX, touch2.clientY
          );
          initialSize = stamps[selectedStampIndex].size;
        }
        } else if (!e.touches || e.touches.length === 1) {
          // 空いている場所をクリックした場合は新しいスタンプを追加
          // 座標はCanvas要素全体の座標系で保存（drawStampedImage()でoffsetX/Yを引いて使用）
          stamps.push({
            x: x,
            y: y,
            size: STAMP_SIZE
          });
          selectedStampIndex = stamps.length - 1;
          isDragging = true;
          dragStartX = x;
          dragStartY = y;
          drawStampedImage();
        }
      }
    };
    
    // マウス/タッチ移動
    const handleMove = (e) => {
      if (postScreen && postScreen.style.display === 'none') return;
      if (!originalImage) return;
      
      // ドラッグ中またはリサイズ中の場合のみpreventDefaultを呼び出す
      if (isDragging || isResizing) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      
      const rect = canvas.getBoundingClientRect();
      
      if (isResizing && e.touches && e.touches.length === 2 && selectedStampIndex >= 0) {
        // ピンチズームでサイズ変更
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = getDistance(
          touch1.clientX, touch1.clientY,
          touch2.clientX, touch2.clientY
        );
        const scale = currentDistance / initialDistance;
        stamps[selectedStampIndex].size = Math.max(20, Math.min(200, initialSize * scale));
        drawStampedImage();
      } else if (isDragging && selectedStampIndex >= 0) {
        // ドラッグで位置変更
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const dx = x - dragStartX;
        const dy = y - dragStartY;
        
        stamps[selectedStampIndex].x += dx;
        stamps[selectedStampIndex].y += dy;
        
        dragStartX = x;
        dragStartY = y;
        drawStampedImage();
      }
    };
    
    // マウス/タッチ終了
    const handleEnd = (e) => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
      }
    };
    
    // イベントリスナーを追加
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleEnd);
  }

  // 「次へ」ボタン（スタンプ編集→プレビュー）
  if (nextToPreviewButton) {
    nextToPreviewButton.addEventListener('click', () => {
      showPreviewStep();
    });
  }

  // 「戻る」ボタン（プレビュー→スタンプ編集）
  if (backToStampButton) {
    backToStampButton.addEventListener('click', () => {
      showStampEditStep();
    });
  }

  // キーボードショートカット（Delete/Backspaceで削除）
  document.addEventListener('keydown', (e) => {
    // スタンプ編集画面が表示されている場合のみ処理
    if (postScreen && postScreen.style.display === 'block' && 
        stampEditStep && stampEditStep.style.display !== 'none') {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStampIndex >= 0) {
        e.preventDefault();
        deleteSelectedStamp();
      }
    }
  });

  Array.from(gallery.querySelectorAll('img')).forEach((img) => {
    attachImageClick(img);
  });

  postButton.addEventListener('click', async () => {
    if (!selectedFile) return;

    // 表示名が未設定の場合は、まず表示名を設定してもらう
    const currentDisplayName = await getDisplayName();
    if (!currentDisplayName) {
      alert('画像を投稿する前に、表示名を設定してください。');
      openDisplayNameModal();
      return;
    }

    // 投稿ボタンを無効化してローディング状態に
    const originalText = postButton.textContent;
    postButton.disabled = true;
    postButton.textContent = 'アップロード中...';

    try {
      // Canvasからスタンプ付き画像を取得
      const stampedImageBlob = await getStampedImageBlob();
      const fileToUpload = stampedImageBlob || selectedFile;
      
      // Cloudinaryにアップロード
      const { url, publicId } = await uploadToCloudinary(fileToUpload);

      const tagLabel = tagInput.value?.trim() || '';
      const comment = commentInput?.value?.trim() || '';
      const postedAt = formatDateTime(new Date());
      const userKey = getUserKey();
      const deleteToken = generateDeleteToken();

      // Supabaseにメタデータを保存
      let photoId = null;
      if (supabaseClient) {
        try {
          const photoData = {
            user_key: userKey,
            name_tag: tagLabel,
            comment: comment || null, // 空文字列の場合はnullに変換
            cloudinary_url: url,
            cloudinary_public_id: publicId,
            delete_token: deleteToken,
            created_at: new Date().toISOString(),
          };
          const savedData = await savePhotoToSupabase(photoData);
          photoId = savedData?.id;
        } catch (error) {
          console.warn('Supabase保存に失敗しましたが、画像は表示します:', error);
        }
      }

      const img = document.createElement('img');
      img.alt = tagLabel || '投稿された画像';
      img.src = url;
          img.dataset.tag = tagLabel;
          img.dataset.comment = comment; // コメントを保存
          img.dataset.date = postedAt;
          img.dataset.owner = 'my';
          img.dataset.userKey = userKey; // user_keyを保存
          img.dataset.publicId = publicId; // Cloudinaryのpublic_idを保存
      if (photoId) {
        img.dataset.photoId = photoId; // SupabaseのIDを保存
        img.dataset.deleteToken = deleteToken; // 削除トークンを保存
      }

      attachImageClick(img);
      gallery.prepend(img);
      renderTagFilter();
      filterGallery();
      closePostScreen();
    } catch (error) {
      console.error('画像のアップロードに失敗しました', error);
      alert(`画像のアップロードに失敗しました: ${error.message}`);
    } finally {
      postButton.disabled = false;
      postButton.textContent = originalText;
    }
  });

  if (postScreenClose) {
    postScreenClose.addEventListener('click', () => {
      closePostScreen();
    });
  }


      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          if (editModal && editModal.classList.contains('is-open')) {
            closeEditModal();
          } else if (profileModal && profileModal.classList.contains('is-open')) {
            closeProfileModal();
          } else if (displayNameModal && displayNameModal.classList.contains('is-open')) {
            closeDisplayNameModal();
          } else if (postScreen && postScreen.style.display !== 'none') {
            closePostScreen();
          } else if (viewerModal.classList.contains('is-open')) {
            closeViewer();
          }
        } else if (event.key === 'ArrowRight' && viewerModal.classList.contains('is-open')) {
          showNextViewerImage();
        } else if (event.key === 'ArrowLeft' && viewerModal.classList.contains('is-open')) {
          showPreviousViewerImage();
        }
      });

  viewerClose.addEventListener('click', () => {
    closeViewer();
  });

  // 3点リーダーメニューのイベントリスナー
  if (viewerMenuButton) {
    viewerMenuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (viewerMenuDropdown) {
        viewerMenuDropdown.classList.toggle('is-open');
      }
    });
  }

  // メニュー外をクリックしたら閉じる
  document.addEventListener('click', (event) => {
    if (viewerMenuDropdown && viewerMenuDropdown.classList.contains('is-open')) {
      if (viewerMenu && !viewerMenu.contains(event.target)) {
        viewerMenuDropdown.classList.remove('is-open');
      }
    }
  });

  // 編集ボタンのイベントリスナー
  if (viewerEdit) {
    viewerEdit.addEventListener('click', () => {
      if (viewerMenuDropdown) {
        viewerMenuDropdown.classList.remove('is-open');
      }
      openEditModal();
    });
  }

  // 削除ボタンのイベントリスナー
  if (viewerDelete) {
    viewerDelete.addEventListener('click', () => {
      if (viewerMenuDropdown) {
        viewerMenuDropdown.classList.remove('is-open');
      }
      deleteCurrentImage();
    });
  }

  if (editModalClose) {
    editModalClose.addEventListener('click', () => {
      closeEditModal();
    });
  }

  if (editModal) {
    editModal.addEventListener('click', (event) => {
      if (event.target === editModal) {
        closeEditModal();
      }
    });
  }

  if (editSaveButton) {
    editSaveButton.addEventListener('click', () => {
      saveEdit();
    });
  }

  if (editTagInput && editDateInput && editCommentInput) {
    // Enterキーで保存（Ctrl+EnterまたはCmd+Enter）
    editTagInput.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveEdit();
      }
    });
    editDateInput.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveEdit();
      }
    });
    editCommentInput.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveEdit();
      }
    });
  }

  viewerModal.addEventListener('click', (event) => {
    if (event.target === viewerModal) {
      closeViewer();
    }
  });

  viewerModal.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchMoveX = touchStartX;
  });

  viewerModal.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 1) return;
    touchMoveX = event.touches[0].clientX;
  });

  viewerModal.addEventListener('touchend', () => {
    const deltaX = touchMoveX - touchStartX;
    const threshold = 40;
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        showNextViewerImage();
      } else {
        showPreviousViewerImage();
      }
    }

    touchStartX = 0;
    touchMoveX = 0;
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab || 'my';
      setActiveTab(targetTab);
    });
  });

  searchClear.addEventListener('click', () => {
    if (!searchInput) return;
    searchInput.value = '';
    currentSearchQuery = '';
    filterGallery();
    searchInput.focus();
  });

  searchInput.addEventListener('input', () => {
    currentSearchQuery = searchInput.value;
    filterGallery();
  });

  // 表示名入力モーダルのイベントリスナー
  if (displayNameSaveButton) {
    displayNameSaveButton.addEventListener('click', () => {
      saveDisplayNameAndClose();
    });
  }

  if (displayNameModal) {
    displayNameModal.addEventListener('click', (event) => {
      if (event.target === displayNameModal) {
        closeDisplayNameModal();
      }
    });

    // Enterキーで保存
    if (displayNameInput) {
      displayNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          saveDisplayNameAndClose();
        } else if (event.key === 'Escape') {
          closeDisplayNameModal();
        }
      });
    }
  }

      // 表示名をクリックして編集できるようにする
      if (displayNameElement) {
        displayNameElement.addEventListener('click', () => {
          // 「みんな」タブの場合は編集できない
          if (currentTab === 'all') {
            return;
          }
          // ユーザーページの場合も編集できない
          const isUserPage = currentRoute && currentRoute.type === 'user';
          if (isUserPage) {
            return;
          }
          if (displayNameInput) {
            // 現在の表示名を入力欄に設定（「のアルバム」を除く）
            const currentName = displayNameElement.textContent;
            if (currentName && currentName !== 'アルバム' && currentName.endsWith('のアルバム')) {
              displayNameInput.value = currentName.replace('のアルバム', '');
            } else if (currentName && currentName !== 'アルバム') {
              displayNameInput.value = currentName;
            }
          }
          openDisplayNameModal();
        });
      }

      // ユーザーアイコンボタンのイベントリスナー
      if (userIconButton) {
        userIconButton.addEventListener('click', () => {
          openProfileModal();
        });
      }

      // プロフィールモーダルのイベントリスナー
      if (profileModalClose) {
        profileModalClose.addEventListener('click', () => {
          closeProfileModal();
        });
      }

      if (profileModal) {
        profileModal.addEventListener('click', (event) => {
          if (event.target === profileModal) {
            closeProfileModal();
          }
        });
      }

      // プロフィール保存ボタンのイベントリスナー
      if (profileSaveButton) {
        profileSaveButton.addEventListener('click', async () => {
          if (!profileDisplayNameInput) return;

          const displayName = profileDisplayNameInput.value.trim();
          if (!displayName) {
            alert('アカウント名を入力してください');
            return;
          }

          const success = await saveDisplayName(displayName);
          if (success) {
            await updateDisplayNameUI();
            closeProfileModal();
          }
        });
      }

      // プロフィールモーダルでEnterキーで保存
      if (profileDisplayNameInput) {
        profileDisplayNameInput.addEventListener('keydown', async (event) => {
          if (event.key === 'Enter' && profileSaveButton) {
            event.preventDefault();
            profileSaveButton.click();
          } else if (event.key === 'Escape') {
            closeProfileModal();
          }
        });
      }

  // 戻るボタンのイベントリスナー
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  // ルーティング処理
  const initializeRoute = async () => {
    currentRoute = parseRoute();
    updateUIForRoute(currentRoute);

    if (currentRoute.type === 'user') {
      // ユーザーページの場合
      const userKey = currentRoute.userKey;
      
      // 表示名を取得して表示
      await updateDisplayNameUI(userKey);
      
      // そのユーザーの画像を読み込み
      await loadPhotosFromDatabase(userKey);
      
      // 空の状態メッセージを表示（画像がない場合）
      if (emptyState && gallery) {
        // 画像の読み込みを待つ
        setTimeout(() => {
          const images = gallery.querySelectorAll('img');
          const emptyMessage = emptyState.querySelector('.empty-state__message');
          if (images.length === 0) {
            emptyState.classList.add('is-visible');
            if (emptyMessage) {
              emptyMessage.textContent = 'このユーザーはまだ画像を投稿していません';
            }
            gallery.style.display = 'none';
          } else {
            emptyState.classList.remove('is-visible');
            gallery.style.display = 'grid';
          }
        }, 100);
      }
    } else {
      // ホームページの場合
      // ページ読み込み時にSupabaseからデータを取得
      await loadPhotosFromDatabase();

      // 表示名を取得して表示
      await updateDisplayNameUI().then(() => {
        // 表示名が未設定の場合、初回アクセス時にモーダルを表示
        getDisplayName().then((displayName) => {
          if (!displayName) {
            // 少し遅延させてからモーダルを表示（ページ読み込み完了後）
            setTimeout(() => {
              openDisplayNameModal();
            }, 500);
          }
        });
      });

      setActiveTab('my');
    }
  };

  // ページ読み込み時にルーティングを初期化
  initializeRoute();

  // ブラウザの戻る/進むボタンに対応
  window.addEventListener('popstate', () => {
    initializeRoute();
  });
}

