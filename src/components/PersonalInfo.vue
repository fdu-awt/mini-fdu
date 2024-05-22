<script>
import {
	ElMessage,
	ElForm,
	ElFormItem,
	ElInput,
	ElSelect,
	ElOption,
	ElButton,
	ElDialog,
	ElNotification
} from 'element-plus';
import * as CHECK from "@/utils/check";
import {deepCopy} from "@/utils/copy";
import {getUserInfo, modifyPassword, modifyUserInfo} from "@/api/user";
import SELF_IMAGE from "@/three/self-image/self-image";
import STORAGE from "@/store";
import {GAME_EVENTS} from "@/event/GameEventEmitter";
import gameEventEmitter from "@/event/GameEventEmitter";

export default {
	name: "PersonalInfo",
	components: {
		ElForm,
		ElFormItem,
		ElInput,
		ElSelect,
		ElOption,
		ElButton,
		ElDialog
	},
	data() {
		return {
			buttonMsg: "选择虚拟形象",
			choices: SELF_IMAGE.getModelChoices(),
			form: {
				username: "",
				email: "",
				selfImage: "",
			},
			formOld: {
				username: "",
				email: "",
				selfImage: "",
			},
			shouldInitializeModel: true,
			passwordModifyDialogVisible: false,
			passwordForm: {
				oldPassword: "",
				newPassword: "",
				confirmPassword: "",
			},
			rules: {
				oldPassword: [
					{ required: true, message: '请输入旧密码', trigger: 'blur' }
				],
				newPassword: [
					{ required: true, message: '请输入新密码', trigger: 'blur' },
					{ min: 5, message: '密码长度至少为5个字符', trigger: 'blur' },
					{ max: 15, message: '密码长度不能超过15个字符', trigger: 'blur' },
				],
				confirmPassword: [
					{ required: true, message: '请再次输入新密码', trigger: 'blur' },
					{ validator: this.matchPassword, trigger: 'blur' }
				]
			}
		};
	},
	mounted() {
		this.getUserInfo();
	},
	methods: {
		handleSubmit () {
			const username_check = CHECK.checkUsername(this.form.username);
			if (!username_check.pass) {
				ElMessage({
					showClose: true,
					message: username_check.msg,
					type: "error",
				});
				return;
			}
			const email_check = CHECK.checkEmail(this.form.email);
			if (!email_check.pass) {
				ElMessage({
					showClose: true,
					message: email_check.msg,
					type: "error",
				});
				return;
			}
			if (!SELF_IMAGE.validName(this.form.selfImage)) {
				console.warn("选择了错误的虚拟形象", this.form.selfImage);
				ElMessage({
					showClose: true,
					message: "请选择正确的虚拟形象",
					type: "error",
				});
				return;
			}
			if (this.form.username === this.formOld.username && this.form.email === this.formOld.email && this.form.selfImage === this.formOld.selfImage) {
				ElMessage({
					showClose: true,
					message: "没有修改任何信息",
					type: "warning",
				});
				return;
			}
			modifyUserInfo(this.form.username, this.form.email, this.form.selfImage).then((data) => {
				if (data.code === 200) {
					this.formOld = deepCopy(this.form);
					STORAGE.setSelfImage(this.form.selfImage);
					ElMessage({
						showClose: true,
						message: data.msg,
						type: "success",
					});
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		handleReset () {
			this.form = deepCopy(this.formOld);
		},
		getUserInfo () {
			getUserInfo().then((data) => {
				if (data.code === 200) {
					this.form = deepCopy(data.object);
					this.formOld = deepCopy(data.object);
					if (!data.object.selfImage) {
						console.warn("没有个人形象信息！");
						this.form.selfImage = SELF_IMAGE.defaultModelName;
						this.formOld.selfImage = SELF_IMAGE.defaultModelName;
					}
					STORAGE.setSelfImage(this.form.selfImage);
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		showPasswordModifyDialogForm() {
			this.passwordModifyDialogVisible = true;
		},
		onSelfImageChange() {
			// console.log("选择了虚拟形象", this.form.selfImage);
			gameEventEmitter.emit(GAME_EVENTS.USER_SELF_IMAGE_CHANGE, this.form.selfImage);
		},
		matchPassword(rule, value, callback) {
			if (value === '') {
				callback(new Error('请确认新密码'));
			} else if (value !== this.passwordForm.newPassword) {
				callback(new Error('两次输入的密码不一致'));
			} else {
				callback();
			}
		},
		modifyPassword () {
			this.$refs.passwordForm.validate((valid) => {
				if (valid) {
					modifyPassword(this.passwordForm.oldPassword, this.passwordForm.newPassword).then((data) => {
						if (data.code === 200) {
							this.passwordModifyDialogVisible = false;
							ElNotification({
								title: "密码修改成功，请重新登陆",
								type: "success",
							});
							// 需要重新登陆
							this.logOut();
						}
					}).catch((err) => {
						console.error(err);
					});
				} else {
					ElMessage({
						showClose: true,
						message: "请检查输入",
						type: "error",
					});
					return false;
				}
			});
		},
		logOut() {
			STORAGE.logOut();
			this.$router.push('/login');
		},
	},
};
</script>

<template>
	<div id="container">
		<div class="user-profile">
			<el-form :model="form" label-width="auto" size="large" label-position="left" >
				<el-form-item label="用户名">
					<el-input v-model="form.username" placeholder="请输入用户名" autocomplete="off"/>
				</el-form-item>
				<el-form-item label="邮箱">
					<el-input v-model="form.email" placeholder="请输入邮箱"/>
				</el-form-item>
				<el-form-item label="虚拟形象">
					<el-select
							v-model="form.selfImage"
							@change="onSelfImageChange"
							filterable
							placeholder="请选择虚拟形象">
						<el-option
								v-for="item in choices"
								:key="item"
								:label="item"
								:value="item">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<div class="submit-btn-container">
						<div class="submit-btn-content" @click="handleSubmit">
							<span class="btn-title">提交</span>
							<span class="icon-arrow">
								<svg width="66px" height="43px" viewBox="0 0 66 43" xmlns="http://www.w3.org/2000/svg">
									<g id="arrow" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
										<path id="arrow-icon-one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path>
										<path id="arrow-icon-two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path>
										<path id="arrow-icon-three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path>
									</g>
								</svg>
							</span>
						</div>
					</div>
				</el-form-item>
				<el-form-item>
					<div class="action-btn-container">
						<button class="simple-btn" type="button" @click="showPasswordModifyDialogForm">修改密码</button>
						<button class="simple-btn" type="button" @click="logOut">登出</button>
					</div>
				</el-form-item>
			</el-form>
		</div>
	</div>
	<el-dialog v-model="passwordModifyDialogVisible" title="修改密码" width="500">
		<el-form :model="passwordForm" :rules="rules" ref="passwordForm">
			<el-form-item label="旧密码" prop="oldPassword">
				<el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码"/>
			</el-form-item>
			<el-form-item label="新密码" prop="newPassword">
				<el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"/>
			</el-form-item>
			<el-form-item label="确认密码" prop="confirmPassword">
				<el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="passwordModifyDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="modifyPassword">确 定</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<style scoped>
#container {
	height: 100%;
	width: 100%;
	background-color: var(--background-color);
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	transition: width 0.5s ease-in-out;
	overflow: hidden;
}

.user-profile {
	max-width: 500px;
	margin: auto;
}

/* 用于修改密码的 button 和 登出的 button */
.action-btn-container {
	margin-top: 20px;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	--color-text: #f3f7fe;
	--color-background: var(--primary-color);
	--color-shadow: 0 0 0 5px #3b83f65f;
}
.simple-btn {
	margin-left: 20px;
	margin-right: 20px;
	background-color:  var(--color-background);
	color: var(--color-text);
	border: none;
	border-radius: 8px;
	width: 100px;
	height: 45px;
	transition: .3s;
	font-family: 'Poppins', sans-serif;
	font-weight: 550;
	font-size: 18px;
}

.simple-btn:hover {
	background-color:  var(--primary-color);
	box-shadow: var(--color-shadow);
	color: var(--color-text);
}

/* 用于提交的 button*/
.submit-btn-container {
	width: 300px;
	height: 40px;
	display: flex;
	justify-content: center;
	--color-text: #ffffff;
	--color-background: var(--primary-color);
	--color-outline: var(--primary-color-2);
	--color-shadow: #00000080;
}

.submit-btn-content {
	display: flex;
	align-items: center;
	padding: 5px 30px;
	text-decoration: none;
	font-family: 'Poppins', sans-serif;
	font-weight: 600;
	font-size: 20px;
	color: var(--color-text);
	background: var(--color-background);
	transition: 1s;
	border-radius: 100px;
	box-shadow: 0 0 0.2em 0 var(--color-background);
}

.submit-btn-content:hover, .submit-btn-content:focus {
	transition: 0.5s;
	-webkit-animation: btn-content 1s;
	animation: btn-content 1s;
	outline: 0.1em solid transparent;
	outline-offset: 0.2em;
	box-shadow: 0 0 0.4em 0 var(--color-background);
}

.submit-btn-content .icon-arrow {
	transition: 0.5s;
	margin-right: 0;
	transform: scale(0.6);
}

.submit-btn-content:hover .icon-arrow {
	transition: 0.5s;
	margin-right: 25px;
}

.icon-arrow {
	width: 20px;
	margin-left: 15px;
	position: relative;
	top: 6%;
}

/* SVG */
#arrow-icon-one {
	transition: 0.4s;
	transform: translateX(-60%);
}

#arrow-icon-two {
	transition: 0.5s;
	transform: translateX(-30%);
}

.submit-btn-content:hover #arrow-icon-three {
	animation: color_anim 1s infinite 0.2s;
}

.submit-btn-content:hover #arrow-icon-one {
	transform: translateX(0%);
	animation: color_anim 1s infinite 0.6s;
}

.submit-btn-content:hover #arrow-icon-two {
	transform: translateX(0%);
	animation: color_anim 1s infinite 0.4s;
}

/* SVG animations */
@keyframes color_anim {
	0% {
		fill: white;
	}

	50% {
		fill: var(--color-background);
	}

	100% {
		fill: white;
	}
}

/* Button animations */
@-webkit-keyframes btn-content {
	0% {
		outline: 0.2em solid var(--color-background);
		outline-offset: 0;
	}
}

@keyframes btn-content {
	0% {
		outline: 0.2em solid var(--color-background);
		outline-offset: 0;
	}
}
</style>