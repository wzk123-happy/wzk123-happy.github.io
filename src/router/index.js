import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' //导入首页组件

const router = createRouter({  //创建一个路由实例
  //使用 HTML5 历史模式，URL 看起来像正常路径（没有 #）
  //import.meta.env.BASE_URL 是 Vite 提供的环境变量，通常是 /。
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [  //路由规则数组，每个规则是一个对象
    {
      path: '/',
      name: 'home',  //可以给路由起个名字，方便跳转时使用
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      //是动态导入，只有访问 /about 时才会加载 AboutView.vue 的代码，这叫路由懒加载，可以优化首屏加载速度。
    },
    {
      path:'/posts',
      redirect:'/' //将 /posts 重定向到首页
    },
    {
      path:'/post/:id',   // 动态路由参数 :id，在组件中可以通过 useRoute().params.id 获取这个值
      name:'post',
      component: () => import('../views/PostView.vue')
    }
  ],
})

export default router
