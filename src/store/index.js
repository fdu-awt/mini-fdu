import { reactive } from 'vue';
import * as STORAGE from '@/store/storage';

const store = reactive({
	state: {
		user: STORAGE.getUser(),
		selfImage: STORAGE.getSelfImage(),
	},
	mutations: {
		login (state, user) {
			state.user = user;
			STORAGE.loginSuccess(user);
		},
		logout (state) {
			state.user = {
				username: '',
				token: '',
				tokenExpireTime: '',
			};
			STORAGE.logOut();
		},
		setSelfImage (state, selfImage) {
			state.selfImage = selfImage;
			STORAGE.setSelfImage(selfImage);
		},
	}
});

export default store;