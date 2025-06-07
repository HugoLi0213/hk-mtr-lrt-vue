<template>
  <div class="user-content">
    <div class="content-section">
      <h3>收藏管理</h3>
      <p class="section-desc">管理你收藏的路線和車站</p>
      
      <div class="empty-state" v-if="!hasBookmarks">
        <div class="empty-icon">📌</div>
        <p>還沒有收藏任何內容</p>
        <button class="add-btn" @click="addBookmark">新增收藏</button>
      </div>
      
      <div class="bookmark-list" v-else>
        <div class="bookmark-item" v-for="(item, index) in bookmarks" :key="index">
          <span class="bookmark-text">{{ item }}</span>
          <button class="remove-btn" @click="removeBookmark(index)">🗑️</button>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <button class="action-btn" @click="exportData">
        <span class="btn-icon">📤</span>
        匯出資料
      </button>
      <button class="action-btn" @click="importData">
        <span class="btn-icon">📥</span>
        匯入資料
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const bookmarks = ref<string[]>([
  '東涌線 - 香港站',
  '荃灣線 - 中環站',
  '觀塘線 - 旺角站'
]);

const hasBookmarks = ref(bookmarks.value.length > 0);

const addBookmark = () => {
  const newBookmark = prompt('請輸入要收藏的路線或車站：');
  if (newBookmark) {
    bookmarks.value.push(newBookmark);
    hasBookmarks.value = true;
  }
};

const removeBookmark = (index: number) => {
  if (confirm('確定要移除此收藏嗎？')) {
    bookmarks.value.splice(index, 1);
    hasBookmarks.value = bookmarks.value.length > 0;
  }
};

const exportData = () => {
  const data = JSON.stringify(bookmarks.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mtr-bookmarks.json';
  a.click();
  URL.revokeObjectURL(url);
};

const importData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          bookmarks.value = data;
          hasBookmarks.value = bookmarks.value.length > 0;
          alert('資料匯入成功！');
        } catch {
          alert('檔案格式錯誤！');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};
</script>

<style scoped>
.user-content {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.content-section {
  margin-bottom: 24px;
}

.content-section h3 {
  margin: 0 0 4px 0;
  font-size: 1.2em;
  font-weight: bold;
}

.section-desc {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 0.9em;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #666;
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 8px;
}

.add-btn {
  background: #0075C2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 8px;
}

.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bookmark-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.bookmark-text {
  flex: 1;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-btn:hover {
  opacity: 1;
}

.actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f8f9fa;
}

.btn-icon {
  font-size: 1.2em;
}
</style>
