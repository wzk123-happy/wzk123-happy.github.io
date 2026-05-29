<template>
  <div class="about">
    <header class="about-header">
      <span class="about-icon">👤</span>
      <h1 class="about-title">关于本站</h1>
      <p class="about-subtitle">一个用 Vue 3 + Vite 构建的极简博客</p>
    </header>

    <section class="about-section">
      <h2>📖 关于项目</h2>
      <p>
        这是一个使用 Vue 3 组合式 API（Composition API）、Vue Router 和 Vite
        构建的轻量级个人博客。项目采用纯前端方案，文章数据通过静态 JSON 文件管理，
        无需后端服务器即可运行。
      </p>
    </section>

    <section class="about-section">
      <h2>🛠️ 技术栈</h2>
      <ul class="tech-list">
        <li><strong>框架:</strong> Vue 3 (Composition API)</li>
        <li><strong>构建:</strong> Vite</li>
        <li><strong>路由:</strong> Vue Router 4</li>
        <li><strong>数据:</strong> 静态 JSON</li>
      </ul>
    </section>

    <section class="about-section">
      <h2>📬 联系方式</h2>
      <p>如果你有任何问题或建议，欢迎通过以下方式联系：</p>
      <div class="contact-links">
        <a href="mailto:example@blog.com" class="contact-link">📧 Email</a>
        <a href="https://github.com" target="_blank" rel="noopener" class="contact-link">💻 GitHub</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ==============================
   容器
   ============================== */
.about {
  width: 100%;
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
   页面头部
   ============================== */
.about-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.about-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.75rem;
}

.about-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.35rem;
  letter-spacing: -0.5px;
}

.about-subtitle {
  color: #888;
  font-size: 0.95rem;
}

/* ==============================
   内容区块
   ============================== */
.about-section {
  margin-bottom: 2rem;
}

.about-section h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}

.about-section p {
  color: #b0b0b0;
  line-height: 1.8;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

/* ==============================
   技术列表
   ============================== */
.tech-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tech-list li {
  color: #b0b0b0;
  font-size: 0.95rem;
  padding: 0.55rem 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.tech-list li:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.12);
}

.tech-list li strong {
  color: #64b5f6;
  font-weight: 600;
}

/* ==============================
   联系方式
   ============================== */
.contact-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #64b5f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background: rgba(100, 180, 246, 0.08);
  border: 1px solid rgba(100, 180, 246, 0.15);
  border-radius: 8px;
  transition: all 0.2s;
}

.contact-link:hover {
  background: rgba(100, 180, 246, 0.15);
  border-color: rgba(100, 180, 246, 0.3);
  color: #90caf9;
}

/* ==============================
   响应式
   ============================== */
@media (max-width: 768px) {
  .about-title {
    font-size: 1.6rem;
  }

  .about-icon {
    font-size: 2.5rem;
  }

  .contact-links {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .about-title {
    font-size: 1.35rem;
  }
}
</style>
