import {createRouter, createWebHistory} from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import AboutPage from "@/pages/AboutPage.vue";
import LogInPage from "@/pages/LogInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import UserProfile from "@/components/UserProfilePage.vue";
import NotFoundPage from "@/pages/NotFoundPage.vue";
import VideoChatDemo from "@/components/VideoChatDemo.vue";
import STORAGE from "../store";
import {ElMessageBox, ElNotification} from 'element-plus';
import apiEmitter, {API_EVENTS} from "@/event/ApiEventEmitter";
import gameErrorEventEmitter, {GAME_ERROR_EVENTS} from "@/event/GameErrorEventEmitter";

// 定义路由
const routes = [
	{path: '/', component: HomePage, meta: {requireAuth: true}},
	{path: '/home', component: HomePage, meta: {requireAuth: true}},
	{path: '/about', component: AboutPage, meta: {requireAuth: false}},
	{path: '/login', component: LogInPage, meta: {requireAuth: false}},
	{path: '/signup', component: SignUpPage, meta: {requireAuth: false}},
	{path: '/profile', component: UserProfile, meta: {requireAuth: true}},
	{path: '/video', component: VideoChatDemo, meta: {requireAuth: false}},
	// 捕获所有未处理的路径
	{path: '/:pathMatch(.*)*', component: NotFoundPage, meta: {requireAuth: false}},
];

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
	history: createWebHistory(),
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
				query: {redirect: to.fullPath}
			});
		}
	} else {
		next();
	}
});

function notifyAndGoLogin(msg) {
	ElMessageBox.alert(msg, '未授权访问', {
		confirmButtonText: '前往登录',
		type: 'warning'
	}).then(() => {
		STORAGE.logOut();
		router.replace({
			path: '/login',
			query: {redirect: router.currentRoute.value.fullPath}
		}).then();
	}).catch(() => {
		notifyAndGoLogin(msg);
	});
}

// 监听未授权事件
apiEmitter.on(API_EVENTS.UN_AUTH, (msg) => {
	console.error("未授权事件，UN_AUTH：", msg);
	notifyAndGoLogin(msg);
});

// 监听游戏错误事件
// 事实上，这个事件的触发晚于 路由守卫 的检查
gameErrorEventEmitter.on(GAME_ERROR_EVENTS.NO_LOCAL_USER_ID, (msg) => {
	console.error("游戏事件，NO_LOCAL_USER_ID：", msg);
	STORAGE.logOut();
	router.replace({
		path: '/login',
		query: {redirect: router.currentRoute.value.fullPath}
	}).then();
});

export default router;