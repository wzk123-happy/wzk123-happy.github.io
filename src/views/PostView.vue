<template>
  <div class="post">  <!--详细页容器-->
    <h1>{{post.title}}</h1>  <!--post是在script中定义的响应式对象-->
    <div class="content">{{post.content}}</div>  <!--显示文章正文-->
    <router-link to="/">← 返回首页</router-link>  <!--回到首页的链接-->
  </div>
</template>

<script setup>
import {ref,onMounted} from "vue";  //onMounted:生命周期钩子
import {useRoute} from "vue-router"; //useRoute：获取当前路由信息

const route = useRoute()  //获取当前路由信息(可拿到URL中的参数)
const post = ref({title:'',content:''})  //响应式数据：当前文章(初始为空对象)

//模拟文章数据(实际应从API获取)
const allPost = { //是一个普通的JavaScript对象(不是响应式)，来模拟后端数据
  1:{title: '我的第一篇博客',content: '这是完整的文章内容，可以写很多文字……'},
  2:{title: 'Vue 学习心得',content: 'Vue 组合式 API 非常方便……'}
  //实际开发中，会用到fetch请求后端API来获取数据
  //数据仓库,用一个叫 allPosts 的对象存放所有文章正文。
}

//组件挂到页面后执行
onMounted(() =>{ //在组件被挂载到 DOM 后自动执行
  //这里面的代码会在页面渲染后运行，适合做数据获取
  //从路由参数中获取文章的 id（字符串形式）
  const id = route.params.id
  //route.params包含了URL中的动态参数。例如访问 /post/1，route.params.id 就是字符串 "1"
  // 根据 id 从 allPosts 中取出文章数据，如果不存在则显示默认信息
  post.value = allPost[id] || {title: '文章不存在',content: '请检查链接'}
  // ||的意思是，前面找不到，后面的兜底。
})
</script>

<style scoped>
.post {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.content {
  line-height: 1.8;
  font-size: 18px;
}
</style>