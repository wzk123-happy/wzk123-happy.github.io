<template>
  <div class="home">
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
          <span class="title-icon">📰</span>
          最新文章
        </h1>
        <p class="page-subtitle">阅读、思考、分享</p>
      </div>

      <div class="post-list">
        <article v-for="(post, index) in posts" :key="post.id" class="post-card"
                 :style="{ animationDelay: `${index * 0.08}s` }">
          <div class="card-meta">
            <span class="post-date">{{ post.date || '近期' }}</span>
            <span class="post-tag" v-if="post.tag">{{ post.tag }}</span>
          </div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ post.excerpt }}</p>
          <router-link :to="`/post/${post.id}`" class="read-more">
            阅读全文
            <span class="arrow">→</span>
          </router-link>
        </article>
      </div>

      <div v-if="posts.length === 0" class="state-message">
        <p>暂无文章，敬请期待 ✍️</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {supabase} from '../lib/supabaseClient'

const posts = ref([])
const loading = ref(true)
const error = ref(null)

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '近期'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// 从 Supabase 获取文章
async function fetchPosts() {
  loading.value = true
  error.value = null

  try {
    const {data, error: supabaseError} = await supabase
        .from('articles')
        .select('*')
        .order('created_at', {ascending: false})

    if (supabaseError) throw new Error(supabaseError.message)

    // 把数据库字段映射成模板需要的格式（data 可能为 null，需要兜底）
    posts.value = (data || []).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.content.substring(0, 100) + '...',  // 取前100字作为摘要
      content: article.content,
      date: formatDate(article.created_at),
      tag: '技术',  // 可以后续从数据库读取
      views: article.views || 0,
      likes: article.likes || 0
    }))

    console.log('加载成功，文章数:', posts.value.length)
  } catch (err) {
    console.error('加载失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
</script>

<style scoped>
/* ==============================
   首页容器
   ============================== */
.home {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ==============================
   页面标题区
   ============================== */
.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
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
  color: #888;
  font-size: 0.95rem;
  font-weight: 400;
}

/* ==============================
   状态消息（加载/错误/空）
   ============================== */
.state-message {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #b0b0b0;
}

.state-message h3 {
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.state-message p {
  margin-bottom: 1rem;
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

/* ==============================
   旋转加载动画
   ============================== */
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
  to {
    transform: rotate(360deg);
  }
}

/* ==============================
   文章列表
   ============================== */
.post-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  cursor: default;
  animation: card-enter 0.5s ease-out both;
  position: relative;
  overflow: hidden;
}

/* 卡片左侧彩色条 */
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
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
   卡片元信息
   ============================== */
.card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.post-date {
  font-size: 0.8rem;
  color: #888;
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

/* ==============================
   卡片内容
   ============================== */
.post-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  transition: color 0.2s;
}

.post-card:hover .post-title {
  color: #90caf9;
}

.post-excerpt {
  color: #b0b0b0;
  font-size: 0.92rem;
  line-height: 1.65;
  margin-bottom: 1rem;
}

/* ==============================
   阅读全文链接
   ============================== */
.read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #64b5f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
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
    font-size: 1.6rem;
  }

  .post-card {
    padding: 1.25rem;
  }

  .post-title {
    font-size: 1.15rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.35rem;
  }

  .post-card {
    padding: 1rem;
  }

  .post-title {
    font-size: 1.05rem;
  }
}
</style>
