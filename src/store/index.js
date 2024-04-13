import { reactive } from 'vue';
import { getUser, loginSuccess, logOut } from '@/utils/auth';

const store = reactive({
	state: {
		user: getUser(),
	},
	mutations: {
		login (state, user) {
			state.user = user;
			loginSuccess(user.username, user.token);
		},
		logout (state) {
			state.user = {
				username: '',
				token: '',
			};
			logOut();
		},
	}
});

export default store;