<template>
  <div class="post">
    <!-- 加载状态 -->
    <div v-if="loading" class="state-message">
      <span class="spinner"></span>
      <p>正在加载文章…</p>
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
          <p class="footer-text">感谢阅读 ❤️</p>
        </footer>
      </article>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const post = ref({ title: '', content: '' })
const loading = ref(true)

// 将文章内容按换行拆分为段落
const paragraphs = computed(() => {
  if (!post.value.content) return []
  return post.value.content.split('\n').filter(p => p.trim())
})

onMounted(async () => {
  try {
    const res = await fetch('/data/posts.json')
    const allPosts = await res.json()
    const id = parseInt(route.params.id)
    const found = allPosts.find(p => p.id === id)
    post.value = found || { title: '未找到', content: '文章不存在' }
  } catch (err) {
    console.error(err)
    post.value = { title: '错误', content: '加载失败' }
  } finally {
    loading.value = false
  }
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
   加载状态
   ============================== */
.state-message {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #b0b0b0;
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

.footer-text {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
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
