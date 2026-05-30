<template>
  <div class="posts-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="state-message">
      <span class="spinner"></span>
      <p>正在加载文章…</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="state-message state-error">
      <span class="error-icon">⚠️</span>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchPosts">重新加载</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <div class="page-header">
        <h1 class="page-title">
          <span class="title-icon">📝</span>
          全部文章
        </h1>
        <p class="page-subtitle">共 {{ totalCount }} 篇文章</p>
      </div>

      <!-- 搜索框 -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章标题或内容…"
          class="search-input"
          @input="onSearchInput"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
      </div>

      <!-- 搜索结果提示 -->
      <p v-if="searchQuery" class="search-hint">
        搜索 "<strong>{{ searchQuery }}</strong>" 找到 {{ posts.length }} 篇相关文章
      </p>

      <!-- 文章列表 -->
      <div v-if="posts.length > 0" class="post-list">
        <article
          v-for="(post, index) in posts"
          :key="post.id"
          class="post-card"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <div class="card-meta">
            <span class="post-date">{{ post.date || '近期' }}</span>
            <span class="post-tag" v-if="post.tag">{{ post.tag }}</span>
          </div>
          <h2 class="post-title" v-html="highlightMatch(post.title)"></h2>
          <p class="post-excerpt" v-html="highlightMatch(post.excerpt)"></p>
          <div class="card-footer">
            <span class="card-stats">👁️ {{ post.views || 0 }} ❤️ {{ post.likes || 0 }}</span>
            <router-link :to="`/post/${post.id}`" class="read-more">
              阅读全文
              <span class="arrow">→</span>
            </router-link>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="state-message">
        <p v-if="searchQuery">没有找到与 "<strong>{{ searchQuery }}</strong>" 相关的文章</p>
        <p v-else>暂无文章，敬请期待 ✍️</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()

const posts = ref([])
const allPosts = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const totalCount = ref(0)
let searchTimer = null

function formatDate(dateStr) {
  if (!dateStr) return '近期'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// 搜索防抖
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filterPosts()
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  filterPosts()
}

// 本地过滤（不重复请求数据库）
function filterPosts() {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) {
    posts.value = allPosts.value
    return
  }
  posts.value = allPosts.value.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    (p.content && p.content.toLowerCase().includes(q))
  )
}

// 搜索词高亮
function highlightMatch(text) {
  if (!searchQuery.value || !text) return text
  const q = searchQuery.value.trim()
  if (!q) return text
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

async function fetchPosts() {
  loading.value = true
  error.value = null

  try {
    const { data, error: supabaseError } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000)

    if (supabaseError) throw new Error(supabaseError.message)

    const mapped = (data || []).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.description || article.content.substring(0, 100) + '...',
      content: article.content,
      date: formatDate(article.created_at),
      tag: '技术',
      views: article.views || 0,
      likes: article.likes || 0
    }))

    allPosts.value = mapped
    posts.value = mapped
    totalCount.value = mapped.length

    // 如果有搜索词，重新过滤
    if (searchQuery.value) filterPosts()
  } catch (err) {
    console.error('加载失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 读取首页传来的搜索词
  const q = route.query.q
  if (q) {
    searchQuery.value = q
  }
  fetchPosts()
})
</script>

<style scoped>
/* ==============================
   容器
   ============================== */
.posts-page {
  width: 100%;
}

/* ==============================
   页面标题区
   ============================== */
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.35rem;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 1.8rem;
}

.page-subtitle {
  color: #bbb;
  font-size: 0.9rem;
}

/* ==============================
   搜索栏
   ============================== */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s;
}

.search-bar:focus-within {
  border-color: rgba(100, 180, 246, 0.4);
}

.search-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 0.8rem 0;
  background: transparent;
  border: none;
  outline: none;
  color: #ddd;
  font-size: 0.95rem;
  font-family: inherit;
}

.search-input::placeholder {
  color: #bbb;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #bbb;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.search-hint {
  color: #bbb;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 1rem;
}

.search-hint strong {
  color: #64b5f6;
}

/* 高亮标记 */
:deep(mark) {
  background: rgba(100, 180, 246, 0.3);
  color: #fff;
  border-radius: 2px;
  padding: 0 2px;
}

/* ==============================
   状态消息
   ============================== */
.state-message {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #ccc;
}

.state-message h3 {
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.state-error {
  background: rgba(255, 80, 80, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(255, 80, 80, 0.2);
}

.error-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.55rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
}

.spinner {
  display: block;
  width: 36px;
  height: 36px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #64b5f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==============================
   文章列表
   ============================== */
.post-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ==============================
   文章卡片
   ============================== */
.post-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: card-enter 0.5s ease-out both;
  position: relative;
  overflow: hidden;
}

.post-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 1rem;
  bottom: 1rem;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #64b5f6, #ce93d8);
  opacity: 0;
  transition: opacity 0.3s;
}

.post-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.post-card:hover::before {
  opacity: 1;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==============================
   卡片内容
   ============================== */
.card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.post-date {
  font-size: 0.8rem;
  color: #bbb;
}

.post-tag {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(100, 180, 246, 0.15);
  color: #64b5f6;
  padding: 0.15rem 0.6rem;
  border-radius: 100px;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.4rem;
  line-height: 1.4;
  transition: color 0.2s;
}

.post-card:hover .post-title {
  color: #90caf9;
}

.post-excerpt {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.65;
  margin-bottom: 0.85rem;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-stats {
  font-size: 0.8rem;
  color: #bbb;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #64b5f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.read-more .arrow {
  transition: transform 0.2s;
}

.read-more:hover {
  color: #90caf9;
}

.read-more:hover .arrow {
  transform: translateX(3px);
}

/* ==============================
   响应式
   ============================== */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .post-card {
    padding: 1.25rem;
  }

  .post-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.3rem;
  }

  .post-card {
    padding: 1rem;
  }

  .post-title {
    font-size: 1rem;
  }
}
</style>
