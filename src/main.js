import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css';  // 确保引入了Element Plus的CSS

createApp(App)
    .use(router)
    .mount('#app');
