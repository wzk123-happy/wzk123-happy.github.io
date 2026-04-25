<template>
  <div id="app">
    <nav>   <!--主导航链接 router-link生成路由链接-->
      <router-link to="/">首页</router-link> | <!--to / 表示点击后跳转到根路径-->
      <router-link to="/about">关于</router-link> |
      <router-link to="/posts">文章</router-link>
      <!--router-link与a标签不同，不会刷新整个界面，而是使用Vue Router 在内部切换组件，实现单页面应用的效果-->
      <!--|就是普通竖线字符，来分隔链接-->
    </nav>

    <router-view />  <!--路由出口：当前路由对应的页面组件会显示在这里-->
    <!--是最重要的占位符。当用户点击链接时，对应的页面组件如HomeView会被渲染到这里，相当于插槽，内容动态变化-->
  </div>
</template>


<style scoped>  /*设置导航栏的样式*/
/*scoped让样式只作用于当前App.vue组件，不会泄露给别的组件*/
/*style内部是普通的CSS样式*/
nav {
  background-color: aqua;
  padding: 1rem;  /*px：写死像素大小。rem：相对根元素html的字体大小*/
  /*默认浏览器html字体大小=16px。1rem=16px*/
  text-align: center;  /*文字居中*/
  max-width: 100%;
}

nav a{  /*router-link最终在浏览器中会被渲染为a标签*/
  margin: 0 0.5rem; /*margin：外边距，控制元素间的距离。margin：上下 左右；*/
  text-decoration: none; /*去掉链接默认下划线*/
  color: #007bff;
}

nav a:hover{  /*hover：鼠标放上去会触发相应的效果*/
  text-decoration: underline;
}
</style>