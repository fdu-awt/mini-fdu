import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';  // 确保引入了Element Plus的CSS
import '@/styles/global.css'; // 引入全局样式

createApp(App)
	.use(router)
	.use(ElementPlus)
	.mount('#app');
