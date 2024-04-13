// store.js
import { reactive } from 'vue';

const store = reactive({
	state: {
		user: {
			username: window.localStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.localStorage.getItem('user' || '[]')).username
		}
	},
	mutations: {
		login (state, user) {
			state.user = user;
			window.localStorage.setItem('user', JSON.stringify(user));
		}
	}
});

export default store;