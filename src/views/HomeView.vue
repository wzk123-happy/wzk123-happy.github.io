<template>
  <div class="home">  <!--给首页一个CSS类，方便样式控制-->
    <h1>最新文章</h1>
    <div class="post-list">  <!--包裹文章列表的容器-->
      <!--v-for是vue的指令，来循环渲染元素-->
      <!--post in posts:遍历posts数组，每次循环将当前赋值给post-->
      <!--这里用文章id作为唯一标识，帮vue高效更新列表。-->
      <!--class="post-card":给每篇文章卡片添加CSS类-->
      <!--{{}}是vue的文本插值语法，post来自v-for循环-->
      <div v-for="post in posts" :key="post.id" class="post-card">
        <h2>{{post.title}}</h2>
        <p>{{post.excerpt}}</p>   <!--显示文章摘要-->
        <router-link :to="`/post/${post.id}`">阅读全文</router-link>
        <!--``反引号， JS 专门用来拼接变量的字符串语法。不写就无法把 post.id 拼进链接里-->
        <!--/post/${post.id}:会生成/post/1、/post/2等链接-->
      </div>
    </div>
  </div>
</template>

<script setup>
//import TheWelcome from '../components/TheWelcome.vue'
import {ref} from "vue";
//ref函数：用来创建响应式数据，当数据改变时，页面中用到它的地方会自动更新
const posts = ref([  //定义响应式数据：文章列表
    //创建一个响应式数组posts，初始包含两篇文章
  {
    id:1,
    title:'我的第一篇博客',
    excerpt: '这是我用vue搭建博客的第一篇文章，欢迎来阅读！',
    content:'完整的文章内容......'
  },
  {
    id:2,
    title:'Vue学习心得',
    excerpt: '分享学习Vue的体会和最佳实践。',
    content:'Vue真的很好用......'
  }
])
</script>

<style scoped>
.home{
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;  /*内边距*/
}

.post-card{
  border: 1px solid #ccc;
  border-radius: 8px;  /*圆角*/
  padding: 15px;
  margin-bottom: 20px;  /*下边距*/
}

.post-card h2{
  color: #42b983;  /*文章标题颜色*/
}
</style>