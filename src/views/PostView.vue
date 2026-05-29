<template>
  <div class="post">
    <!-- 加载状态 -->
    <div v-if="loading" class="state-message">
      <span class="spinner"></span>
      <p>正在加载文章…</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMsg" class="state-message state-error">
      <span class="error-icon">⚠️</span>
      <h3>加载失败</h3>
      <p>{{ errorMsg }}</p>
      <router-link to="/" class="back-link">← 返回首页</router-link>
    </div>

    <!-- 文章内容 -->
    <template v-else>
      <router-link to="/" class="back-link">
        <span class="back-arrow">←</span> 返回首页
      </router-link>

      <article class="post-article">
        <header class="post-header">
          <div class="post-meta">
            <span class="post-date">{{ post.date || '近期' }}</span>
            <span class="post-tag" v-if="post.tag">{{ post.tag }}</span>
          </div>
          <h1 class="post-title">{{ post.title }}</h1>
        </header>

        <div class="post-body">
          <p v-for="(paragraph, i) in paragraphs" :key="i" class="post-paragraph">{{ paragraph }}</p>
        </div>

        <footer class="post-footer">
          <div class="divider"></div>
          <div class="stats">
            <span>👁️ {{ post.views || 0 }} 次阅读</span>
            <button @click="likeArticle" class="like-btn">❤️ {{ post.likes || 0 }} 点赞</button>
            <span>💬 {{ comments.length }} 评论</span>
          </div>
        </footer>

        <!-- 评论区 -->
        <section class="comments-section">
          <div class="divider"></div>
          <h3 class="comments-title">💬 评论 ({{ comments.length }})</h3>

          <!-- 评论列表 -->
          <div v-if="commentsLoading" class="state-message">
            <span class="spinner spinner-sm"></span>
            <p>加载评论…</p>
          </div>

          <div v-else-if="comments.length === 0" class="comments-empty">
            <p>暂无评论，来说两句吧 ✍️</p>
          </div>

          <ul v-else class="comments-list">
            <li v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.user_name || '匿名' }}</span>
                <span class="comment-time">{{ comment.created_at }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </li>
          </ul>

          <!-- 发表评论表单 -->
          <div class="comment-form">
            <h4>发表评论</h4>
            <input
              v-model="newAuthor"
              type="text"
              placeholder="你的昵称（选填）"
              class="comment-input"
              maxlength="30"
            />
            <textarea
              v-model="newContent"
              placeholder="写下你的想法…"
              class="comment-textarea"
              rows="3"
              maxlength="500"
            ></textarea>
            <div class="comment-form-footer">
              <span class="char-count">{{ newContent.length }}/500</span>
              <button
                @click="submitComment"
                :disabled="!newContent.trim() || submitLoading"
                class="submit-btn"
              >
                {{ submitLoading ? '提交中…' : '发表评论' }}
              </button>
            </div>
            <p v-if="commentError" class="comment-error">{{ commentError }}</p>
          </div>
        </section>
      </article>
    </template>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {supabase} from '../lib/supabaseClient'

const route = useRoute()
const post = ref({title: '', content: '', date: '', tag: '', views: 0, likes: 0})
const loading = ref(true)
const errorMsg = ref(null)

// 评论相关状态
const comments = ref([])
const commentsLoading = ref(false)
const newAuthor = ref('')
const newContent = ref('')
const submitLoading = ref(false)
const commentError = ref('')

// 将文章内容按换行拆分为段落
const paragraphs = computed(() => {
  if (!post.value.content) return []
  return post.value.content.split('\n').filter(p => p.trim())
})

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '近期'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// 点赞功能
async function likeArticle() {
  const newLikes = (post.value.likes || 0) + 1
  const {error} = await supabase
      .from('articles')
      .update({likes: newLikes})
      .eq('id', post.value.id)

  if (!error) {
    post.value.likes = newLikes
  } else {
    console.error('点赞失败:', error.message)
    alert('点赞失败: ' + (error.message || '未知错误'))
  }
}

// 加载评论
async function loadComments() {
  commentsLoading.value = true
  const articleId = parseInt(route.params.id)

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })

  if (!error && data) {
    comments.value = data.map(c => ({
      ...c,
      created_at: formatDate(c.created_at)
    }))
  }
  commentsLoading.value = false
}

// 提交评论
async function submitComment() {
  if (!newContent.value.trim()) return

  submitLoading.value = true
  commentError.value = ''

  const articleId = parseInt(route.params.id)

  const { error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      user_name: newAuthor.value.trim() || '匿名',
      content: newContent.value.trim()
    })

  if (error) {
    // 显示 Supabase 返回的具体错误原因
    commentError.value = error.message || '评论提交失败，请稍后重试'
    console.error('评论提交失败:', error)
  } else {
    // 提交成功，清空表单并刷新评论
    newAuthor.value = ''
    newContent.value = ''
    await loadComments()
  }
  submitLoading.value = false
}

// 加载文章
async function loadPost() {
  loading.value = true
  errorMsg.value = null

  const id = parseInt(route.params.id)

  const {data, error} = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

  if (error) {
    console.error('加载失败:', error)
    errorMsg.value = '文章不存在或加载失败'
    loading.value = false
    return
  }

  // 映射数据
  post.value = {
    id: data.id,
    title: data.title,
    content: data.content,
    date: formatDate(data.created_at),
    tag: '技术',
    views: data.views || 0,
    likes: data.likes || 0
  }

  // 增加阅读量（异步，不等待结果）
  supabase
      .from('articles')
      .update({views: (data.views || 0) + 1})
      .eq('id', id)
      .then(({error}) => {
        if (!error) {
          post.value.views = (data.views || 0) + 1
        } else {
          console.error('更新阅读量失败:', error.message)
        }
      })

  loading.value = false
}

onMounted(() => {
  loadPost()
  loadComments()
})
</script>

<style scoped>
/* ==============================
   容器
   ============================== */
.post {
  width: 100%;
}

/* ==============================
   加载/错误状态
   ============================== */
.state-message {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #b0b0b0;
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
   返回链接
   ============================== */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.back-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.back-arrow {
  transition: transform 0.2s;
}

.back-link:hover .back-arrow {
  transform: translateX(-3px);
}

/* ==============================
   文章主体
   ============================== */
.post-article {
  animation: fade-in 0.4s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==============================
   文章头部
   ============================== */
.post-header {
  margin-bottom: 2rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.post-date {
  font-size: 0.85rem;
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

.post-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

/* ==============================
   文章正文
   ============================== */
.post-body {
  line-height: 1.9;
  font-size: 1.05rem;
  color: #d0d0d0;
}

.post-paragraph {
  margin-bottom: 1.25rem;
}

.post-paragraph:last-child {
  margin-bottom: 0;
}

/* ==============================
   文章页脚
   ============================== */
.post-footer {
  margin-top: 2.5rem;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin-bottom: 1.5rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
  color: #888;
}

.like-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.like-btn:hover {
  color: #ff6b6b;
  transform: scale(1.05);
}

.footer-text {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* ==============================
   评论区
   ============================== */
.comments-section {
  margin-top: 1rem;
}

.comments-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.5rem;
}

/* 空状态 */
.comments-empty {
  text-align: center;
  color: #666;
  padding: 2rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
}

/* 评论列表 */
.comments-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* 单条评论 */
.comment-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 1rem 1.15rem;
  transition: all 0.2s;
}

.comment-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 700;
  font-size: 0.9rem;
  color: #64b5f6;
}

.comment-time {
  font-size: 0.75rem;
  color: #666;
}

.comment-content {
  color: #c0c0c0;
  font-size: 0.92rem;
  line-height: 1.7;
}

/* 发表评论表单 */
.comment-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
}

.comment-form h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1rem;
}

.comment-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 0.65rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.comment-input:focus {
  border-color: rgba(100, 180, 246, 0.4);
}

.comment-input::placeholder {
  color: #666;
}

.comment-textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.comment-textarea:focus {
  border-color: rgba(100, 180, 246, 0.4);
}

.comment-textarea::placeholder {
  color: #666;
}

.comment-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.char-count {
  font-size: 0.75rem;
  color: #555;
}

.submit-btn {
  padding: 0.55rem 1.5rem;
  background: #64b5f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.submit-btn:hover:not(:disabled) {
  background: #90caf9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comment-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: center;
}

/* 小号加载动画 */
.spinner-sm {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

/* ==============================
   响应式
   ============================== */
@media (max-width: 768px) {
  .post-title {
    font-size: 1.6rem;
  }

  .post-body {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .post-title {
    font-size: 1.35rem;
  }

  .post-body {
    font-size: 0.95rem;
  }
}
</style>