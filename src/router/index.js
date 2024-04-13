import { createRouter, createWebHistory  } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import AboutPage from "@/pages/AboutPage.vue";
import LogInPage from "@/pages/LogInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
// import store from "../store";

// 定义路由
const routes = [
  { path: '/', component: HomePage },
  { path: '/home', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/login', component: LogInPage },
  { path: '/signup', component: SignUpPage },
];

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
  history: createWebHistory (),
  routes, // `routes: routes` 的缩写
});

router.beforeEach((to, from, next) => {
  // TODO 从 store 中获取用户状态
  // if (to.meta.requireAuth) {
  //     if (store.state.user.username) {
  //         next();
  //     } else {
  //         next({
  //             path: 'login',
  //             query: { redirect: to.fullPath }
  //         });
  //     }
  // }
  next();
});

export default router;