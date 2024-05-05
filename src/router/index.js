import { createRouter, createWebHistory  } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import AboutPage from "@/pages/AboutPage.vue";
import LogInPage from "@/pages/LogInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import UserProfile from "@/pages/UserProfile.vue";
import NotFoundPage from "@/pages/NotFoundPage.vue";
import STORAGE from "../store";
import { ElNotification } from 'element-plus';

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
	routes: routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
	if (to.meta.requireAuth) {
		const user = STORAGE.getUser();
		if (user && user.username && user.token && !STORAGE.isTokenExpired()) {
			next();
		} else {
			ElNotification({
				title: "未登陆",
				message: "请先登陆以访问这个页面。",
				type: "warning",
			});
			next({
				path: 'login',
				query: { redirect: to.fullPath }
			});
		}
	} else {
		next();
	}
});

export default router;