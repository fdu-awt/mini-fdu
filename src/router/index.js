import { createRouter, createWebHistory  } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import AboutPage from "@/pages/AboutPage.vue";
// import store from "../store";

// 定义路由
const routes = [
    { path: '/', component: HomePage },
    { path: '/home', component: HomePage },
    { path: '/about', component: AboutPage },
];

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
    history: createWebHistory (),
    routes, // `routes: routes` 的缩写
});

router.beforeEach((to, from, next) => {
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