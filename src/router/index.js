import { createRouter, createWebHistory  } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import AboutPage from "@/pages/AboutPage.vue";
import LogInPage from "@/pages/LogInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import UserProfile from "@/pages/UserProfile.vue";
import NotFoundPage from "@/pages/NotFoundPage.vue";
// import store from "../store";

// 定义路由
const routes = [
	{ path: '/', component: HomePage, meta: { requireAuth: true }},
	{ path: '/home', component: HomePage, meta: { requireAuth: true }},
	{ path: '/about', component: AboutPage, meta: { requireAuth: false }},
	{ path: '/login', component: LogInPage, meta: { requireAuth: false }},
	{ path: '/signup', component: SignUpPage, meta: { requireAuth: false }},
	{ path: '/profile', component: UserProfile, meta: { requireAuth: true }},
	// 捕获所有未处理的路径
	{ path: '/:pathMatch(.*)*', component: NotFoundPage, meta: { requireAuth: false }},
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