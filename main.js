const addButton = document.getElementById('add-button');
const imagePicker = document.getElementById('image-picker');
const gallery = document.querySelector('.gallery');
const modal = document.getElementById('post-modal');
const modalPreview = document.getElementById('modal-preview');
const tagInput = document.getElementById('tag-input');
const commentInput = document.getElementById('comment-input');
const postButton = document.getElementById('post-button');
const modalClose = document.getElementById('modal-close');
const tabButtons = document.querySelectorAll('.tab-button');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const viewerModal = document.getElementById('viewer-modal');
const viewerImage = document.getElementById('viewer-image');
const viewerTag = document.getElementById('viewer-tag');
const viewerDate = document.getElementById('viewer-date');
const viewerComment = document.getElementById('viewer-comment');
const viewerClose = document.getElementById('viewer-close');
const viewerDelete = document.getElementById('viewer-delete');
const viewerEdit = document.getElementById('viewer-edit');
const tagFilter = document.getElementById('tag-filter');
const emptyState = document.getElementById('empty-state');
const editModal = document.getElementById('edit-modal');
const editTagInput = document.getElementById('edit-tag-input');
const editDateInput = document.getElementById('edit-date-input');
const editCommentInput = document.getElementById('edit-comment-input');
const editSaveButton = document.getElementById('edit-save-button');
const editModalClose = document.getElementById('edit-modal-close');

// Supabaseクライアントの初期化
let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_CONFIG?.url && SUPABASE_CONFIG?.anonKey) {
  if (SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('✅ Supabaseクライアント初期化完了');
    } catch (error) {
      console.error('❌ Supabaseクライアント初期化エラー:', error);
    }
  } else {
    console.warn('⚠️ Supabase設定が未完了です。config.jsを確認してください。');
  }
}

// ユーザーキー（簡易実装。本番環境では認証システムを使用）
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

// 日付をフォーマット（秒なし）
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

// Supabaseデータベース操作関数
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

    console.log('✅ Supabaseに保存成功:', data);
    return data;
  } catch (error) {
    console.error('Supabase保存に失敗しました:', error);
    throw error;
  }
};

const loadPhotosFromSupabase = async () => {
  if (!supabaseClient) {
    console.warn('Supabaseクライアントが初期化されていません');
    return [];
  }

  try {
    const { data, error } = await supabaseClient
      .from('photos')
      .select('id, user_key, name_tag, comment, cloudinary_url, cloudinary_public_id, delete_token, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase読み込みエラー:', error);
      throw error;
    }

    console.log('✅ Supabaseから読み込み成功:', data?.length || 0, '件');
    // コメントが含まれているか確認
    if (data && data.length > 0) {
      console.log('コメントサンプル:', data[0]?.comment || '(コメントなし)');
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

    console.log('✅ Supabaseから削除成功');
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

    console.log('✅ Supabase更新成功:', data[0]);
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

const openModal = (file) => {
  if (!modal || !modalPreview) return;

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  previewUrl = URL.createObjectURL(file);
  modalPreview.src = previewUrl;

  selectedFile = file;

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  tagInput.value = '';
  if (commentInput) {
    commentInput.value = '';
  }
  tagInput.focus();
};

const closeModal = () => {
  if (!modal || !modalPreview) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  modalPreview.src = '';
  selectedFile = null;
  tagInput.value = '';
  if (commentInput) {
    commentInput.value = '';
  }
  imagePicker.value = '';
};

const getGalleryImages = () => {
  if (!gallery) return [];
  return Array.from(gallery.querySelectorAll('img'));
};

const showViewerImageAt = (index, openIfNeeded = true) => {
  if (!viewerModal || !viewerImage || !viewerTag || !viewerDate) return;
  const images = getGalleryImages();
  if (!images.length) return;

  const normalizedIndex =
    ((index % images.length) + images.length) % images.length;
  const img = images[normalizedIndex];
  if (!img) return;

  viewerImage.src = img.src;
  viewerImage.alt = img.alt || '選択中の画像';
  viewerTag.textContent = img.dataset.tag?.trim() || '';
  // 日付をフォーマット（秒なしで表示）
  const dateValue = img.dataset.date;
  if (dateValue && dateValue !== '-') {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        viewerDate.textContent = formatDateTime(date);
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
  }
  currentViewerIndex = normalizedIndex;

  // 編集・削除ボタンの表示/非表示を制御
  const isMyPhoto = img.dataset.owner === 'my';
  if (viewerEdit) {
    if (isMyPhoto) {
      viewerEdit.classList.add('is-visible');
      viewerEdit.dataset.imageIndex = normalizedIndex;
    } else {
      viewerEdit.classList.remove('is-visible');
      delete viewerEdit.dataset.imageIndex;
    }
  }
  if (viewerDelete) {
    if (isMyPhoto) {
      viewerDelete.classList.add('is-visible');
      viewerDelete.dataset.imageIndex = normalizedIndex;
    } else {
      viewerDelete.classList.remove('is-visible');
      delete viewerDelete.dataset.imageIndex;
    }
  }

  if (openIfNeeded || !viewerModal.classList.contains('is-open')) {
    viewerModal.classList.add('is-open');
    viewerModal.setAttribute('aria-hidden', 'false');
  }
};

const openViewer = (img) => {
  const images = getGalleryImages();
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
  currentViewerIndex = -1;

  if (viewerEdit) {
    viewerEdit.classList.remove('is-visible');
    delete viewerEdit.dataset.imageIndex;
  }
  if (viewerDelete) {
    viewerDelete.classList.remove('is-visible');
    delete viewerDelete.dataset.imageIndex;
  }
};

const deleteCurrentImage = async () => {
  if (currentViewerIndex === -1 || !gallery) return;

  const images = getGalleryImages();
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
  console.log('openEditModal called', { currentViewerIndex, gallery: !!gallery, editModal: !!editModal });
  
  if (currentViewerIndex === -1 || !gallery || !editModal) {
    console.warn('openEditModal: 条件チェック失敗', { currentViewerIndex, gallery: !!gallery, editModal: !!editModal });
    return;
  }

  const images = getGalleryImages();
  if (currentViewerIndex >= images.length) {
    console.warn('openEditModal: インデックス範囲外', { currentViewerIndex, imagesLength: images.length });
    return;
  }

  const img = images[currentViewerIndex];
  // 自分の投稿でない場合は編集できない
  if (!img || img.dataset.owner !== 'my') {
    console.warn('編集権限がありません: 自分の投稿ではありません', { img: !!img, owner: img?.dataset.owner });
    alert('自分の投稿のみ編集できます');
    return;
  }
  
  const photoId = img.dataset.photoId;
  if (!photoId) {
    console.warn('編集対象の画像にphotoIdがありません');
    // photoIdがない場合はDOMの値を使用
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

      console.log('✅ Supabaseから最新データを取得:', data);
      // Supabaseから取得した最新データを編集モーダルに設定
      if (editTagInput) {
        editTagInput.value = data.name_tag || '';
      }
      if (editCommentInput) {
        editCommentInput.value = data.comment || '';
        console.log('📝 編集モーダルにコメントを設定（Supabaseから）:', data.comment || '(コメントなし)');
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
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              editDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
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

  // 編集モーダルを開く
  editModal.classList.add('is-open');
  editModal.setAttribute('aria-hidden', 'false');
  
  console.log('編集モーダルを開きました', { 
    hasClass: editModal.classList.contains('is-open'),
    ariaHidden: editModal.getAttribute('aria-hidden'),
    computedDisplay: window.getComputedStyle(editModal).display
  });
  
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
    const currentComment = img.dataset.comment || '';
    editCommentInput.value = currentComment;
    console.log('📝 編集モーダルにコメントを設定（DOMから）:', currentComment || '(コメントなし)');
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
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          editDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
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

  const images = getGalleryImages();
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

  console.log('💾 編集保存:', { tag: newTag, comment: newComment || '(コメントなし)' });

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

    console.log('📤 Supabaseを更新するデータ:', updateData);
    let updatedData = null;
    if (supabaseClient) {
      try {
        updatedData = await updatePhotoInSupabase(photoId, updateData);
        console.log('✅ Supabase更新成功:', updatedData);
        console.log('✅ 更新されたコメント:', updatedData?.comment || '(コメントなし)');
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
  img.dataset.publicId = photoData.cloudinary_public_id || '';
  if (photoData.id) {
    img.dataset.photoId = photoData.id;
  }
  if (photoData.delete_token) {
    img.dataset.deleteToken = photoData.delete_token;
  }
  console.log('📷 画像要素作成:', { tag: img.dataset.tag, comment: img.dataset.comment });
  attachImageClick(img);
  return img;
};

const loadPhotosFromDatabase = async () => {
  if (!supabaseClient) {
    console.log('Supabaseが設定されていないため、データベースからの読み込みをスキップします');
    return;
  }

  try {
    const photos = await loadPhotosFromSupabase();
    
    // 既存の画像をクリア（初期サンプル画像を除く）
    const existingImages = gallery.querySelectorAll('img');
    existingImages.forEach((img) => {
      // サンプル画像（data-owner="all"でdata-photo-idがないもの）は残す
      if (img.dataset.owner === 'all' && !img.dataset.photoId) {
        return;
      }
      img.remove();
    });

    // Supabaseから取得した画像を追加
    photos.forEach((photo) => {
      const img = createImageElement(photo);
      gallery.prepend(img); // 新着順で表示
    });

    // タグフィルターとフィルタリングを更新
    renderTagFilter();
    filterGallery();
  } catch (error) {
    console.error('データベースからの読み込みに失敗しました:', error);
  }
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

  renderTagFilter();
  filterGallery();
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

const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CONFIG.cloudName) {
      reject(new Error('Cloudinary設定が不完全です。'));
      return;
    }

    // 注意: 削除には署名が必要な場合があります
    // 本番環境ではサーバー側で削除を実行することを推奨します
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(`削除に失敗しました: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('ネットワークエラーが発生しました'));
    };

    // 署名付き削除の場合は、サーバー側で署名を生成する必要があります
    // ここでは簡易的な実装のため、エラーを返します
    xhr.send(JSON.stringify({
      public_id: publicId,
      // 署名が必要な場合は、サーバー側で生成してください
    }));
  });
};

if (
  addButton &&
  imagePicker &&
  gallery &&
  modal &&
  modalPreview &&
  tagInput &&
  postButton &&
  modalClose &&
  tabButtons.length &&
  searchInput &&
  searchClear &&
  viewerModal &&
  viewerImage &&
  viewerTag &&
  viewerDate &&
  viewerClose
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

    openModal(file);
  });

  Array.from(gallery.querySelectorAll('img')).forEach((img) => {
    attachImageClick(img);
  });

  postButton.addEventListener('click', async () => {
    if (!selectedFile) return;

    // 投稿ボタンを無効化してローディング状態に
    const originalText = postButton.textContent;
    postButton.disabled = true;
    postButton.textContent = 'アップロード中...';

    try {
      // Cloudinaryにアップロード
      const { url, publicId } = await uploadToCloudinary(selectedFile);

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
          console.log('📤 Supabaseに保存するデータ:', { name_tag: photoData.name_tag, comment: photoData.comment });
          const savedData = await savePhotoToSupabase(photoData);
          photoId = savedData?.id;
          console.log('✅ 保存されたコメント:', savedData?.comment || '(コメントなし)');
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
      img.dataset.publicId = publicId; // Cloudinaryのpublic_idを保存
      if (photoId) {
        img.dataset.photoId = photoId; // SupabaseのIDを保存
        img.dataset.deleteToken = deleteToken; // 削除トークンを保存
      }

      attachImageClick(img);
      gallery.prepend(img);
      renderTagFilter();
      filterGallery();
      closeModal();
    } catch (error) {
      console.error('画像のアップロードに失敗しました', error);
      alert(`画像のアップロードに失敗しました: ${error.message}`);
    } finally {
      postButton.disabled = false;
      postButton.textContent = originalText;
    }
  });

  modalClose.addEventListener('click', () => {
    closeModal();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (editModal && editModal.classList.contains('is-open')) {
        closeEditModal();
      } else if (modal.classList.contains('is-open')) {
        closeModal();
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

  if (viewerEdit) {
    console.log('編集ボタンのイベントリスナーを設定しました');
    viewerEdit.addEventListener('click', () => {
      console.log('編集ボタンがクリックされました');
      openEditModal();
    });
  } else {
    console.error('viewerEdit要素が見つかりません');
  }

  if (viewerDelete) {
    viewerDelete.addEventListener('click', () => {
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

  // ページ読み込み時にSupabaseからデータを取得
  loadPhotosFromDatabase();

  setActiveTab('my');
}

