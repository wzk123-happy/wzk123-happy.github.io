<template>
  <div id="app">
    <div class="background-layer"></div>
    <header class="site-header">
      <div class="header-inner">
        <router-link to="/" class="logo">✨ VueBlog</router-link>
        <nav>
          <router-link to="/">🏠 首页</router-link>
          <router-link to="/about">👤 关于</router-link>
          <router-link to="/posts">📝 文章</router-link>
        </nav>
      </div>
    </header>
    <main>
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    <footer class="site-footer">
      <p>© {{ new Date().getFullYear() }} VueBlog — 用 ❤️ 和 Vue 构建</p>
    </footer>
  </div>
</template>

<script setup>
// App-level component — no additional logic needed
</script>

<style>
/* ==============================
   全局样式重置 & CSS 变量
   ============================== */
:root {
  --color-accent: #64b5f6;
  --color-accent-hover: #90caf9;
  --color-accent-2: #ce93d8;
  --color-success: #81c784;
  --color-warning: #ffb74d;
  --color-glass-bg: rgba(255, 255, 255, 0.06);
  --color-glass-border: rgba(255, 255, 255, 0.12);
  --color-text-primary: #e8e8e8;
  --color-text-secondary: #ccc;
  --color-text-muted: #999;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.4);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: #0a0a0f;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* ==============================
   背景层
   ============================== */
.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url("/bg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.45;
  z-index: -1;
  transform: translateZ(0);
}

/* 背景遮罩渐变（已移除，让背景图清晰可见） */

/* ==============================
   主应用容器
   ============================== */
#app {
  min-height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ==============================
   头部导航
   ============================== */
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(15, 15, 25, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 0 2rem;
  height: 60px;
}

.logo {
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  letter-spacing: -0.5px;
  white-space: nowrap;
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.85;
}

nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

nav a {
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  position: relative;
}

nav a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

nav a.router-link-exact-active {
  color: #fff;
  background: rgba(100, 180, 246, 0.15);
}

nav a.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
}

/* ==============================
   主内容区域
   ============================== */
main {
  flex: 1;
  width: 100%;
  padding: 2.5rem 5%;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
  padding: 2.5rem;
}

/* ==============================
   页面过渡动画
   ============================== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ==============================
   页脚
   ============================== */
.site-footer {
  text-align: center;
  padding: 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* ==============================
   响应式设计
   ============================== */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 1rem;
    height: 56px;
  }

  .logo {
    font-size: 1.15rem;
  }

  nav {
    gap: 0.25rem;
  }

  nav a {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }

  main {
    padding: 1.5rem 3%;
  }

  .content-wrapper {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header-inner {
    padding: 0 0.75rem;
    height: 52px;
  }

  .logo {
    font-size: 1rem;
  }

  nav {
    gap: 0;
  }

  nav a {
    padding: 0.35rem 0.6rem;
    font-size: 0.8rem;
  }

  main {
    padding: 1rem 2%;
  }

  .content-wrapper {
    padding: 1.2rem;
  }
}
</style>