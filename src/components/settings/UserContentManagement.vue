<template>
  <div class="user-content-management">
    <h3>User Content Management</h3>
    
    <div class="management-section">
      <h4>Bookmarks</h4>
      <div class="bookmark-actions">
        <button @click="exportBookmarks" class="action-btn">
          📤 Export Bookmarks
        </button>
        <button @click="importBookmarks" class="action-btn">
          📥 Import Bookmarks
        </button>
        <button @click="clearBookmarks" class="action-btn danger">
          🗑️ Clear All Bookmarks
        </button>
      </div>
      
      <div v-if="bookmarks.length > 0" class="bookmarks-list">
        <h5>Current Bookmarks ({{ bookmarks.length }})</h5>
        <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-item">
          <span>{{ bookmark.name }}</span>
          <button @click="removeBookmark(bookmark.id)" class="remove-btn">×</button>
        </div>
      </div>
      <div v-else class="no-bookmarks">
        <p>No bookmarks saved yet.</p>
      </div>
    </div>

    <input 
      ref="fileInput" 
      type="file" 
      accept=".json" 
      @change="handleImport" 
      style="display: none;"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

interface Bookmark {
  id: string
  name: string
  type: 'station' | 'line'
  data: any
}

const fileInput = ref<HTMLInputElement>()
const bookmarks = reactive<Bookmark[]>([])

onMounted(() => {
  loadBookmarks()
})

const loadBookmarks = () => {
  try {
    const saved = localStorage.getItem('mtr-bookmarks')
    if (saved) {
      const parsed = JSON.parse(saved)
      bookmarks.splice(0, bookmarks.length, ...parsed)
    }
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  }
}

const saveBookmarks = () => {
  try {
    localStorage.setItem('mtr-bookmarks', JSON.stringify(bookmarks))
  } catch (error) {
    console.error('Failed to save bookmarks:', error)
  }
}

const exportBookmarks = () => {
  try {
    const data = JSON.stringify(bookmarks, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mtr-bookmarks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export bookmarks:', error)
    alert('Failed to export bookmarks')
  }
}

const importBookmarks = () => {
  fileInput.value?.click()
}

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const imported = JSON.parse(content)
      
      if (Array.isArray(imported)) {
        // Merge with existing bookmarks, avoiding duplicates
        const existingIds = new Set(bookmarks.map(b => b.id))
        const newBookmarks = imported.filter((b: Bookmark) => !existingIds.has(b.id))
        
        bookmarks.push(...newBookmarks)
        saveBookmarks()
        alert(`Imported ${newBookmarks.length} new bookmarks`)
      } else {
        alert('Invalid bookmark file format')
      }
    } catch (error) {
      console.error('Failed to import bookmarks:', error)
      alert('Failed to import bookmarks')
    }
  }
  reader.readAsText(file)
  
  // Reset file input
  target.value = ''
}

const clearBookmarks = () => {
  if (confirm('Are you sure you want to clear all bookmarks? This action cannot be undone.')) {
    bookmarks.splice(0, bookmarks.length)
    saveBookmarks()
  }
}

const removeBookmark = (id: string) => {
  const index = bookmarks.findIndex(b => b.id === id)
  if (index > -1) {
    bookmarks.splice(index, 1)
    saveBookmarks()
  }
}
</script>

<style scoped>
.user-content-management {
  padding: 20px;
}

.management-section {
  margin-bottom: 24px;
}

h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2em;
}

h4 {
  margin: 0 0 16px 0;
  color: #555;
  font-size: 1.1em;
}

h5 {
  margin: 16px 0 8px 0;
  color: #666;
  font-size: 0.9em;
  font-weight: 600;
}

.bookmark-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.action-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #007AFF;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: left;
}

.action-btn:hover {
  background: #0056CC;
}

.action-btn.danger {
  background: #FF3B30;
}

.action-btn.danger:hover {
  background: #D70015;
}

.bookmarks-list {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.bookmark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid #e9ecef;
}

.bookmark-item:last-child {
  margin-bottom: 0;
}

.bookmark-item span {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.remove-btn {
  background: #ff6b6b;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #fa5252;
}

.no-bookmarks {
  text-align: center;
  padding: 24px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.no-bookmarks p {
  margin: 0;
  font-style: italic;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  h3, h4, h5 {
    color: #fff;
  }
  
  .bookmark-item {
    background: #2c2c2e;
    border-color: #38383a;
  }
  
  .bookmark-item span {
    color: #fff;
  }
  
  .bookmarks-list {
    background: #1c1c1e;
  }
  
  .no-bookmarks {
    background: #1c1c1e;
    border-color: #38383a;
    color: #98989a;
  }
}
</style>