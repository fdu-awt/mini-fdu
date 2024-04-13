<script>
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import * as CHECK from "@/utils/check";
import {deepCopy} from "@/utils/copy";
import {loadAndShowWithoutControl} from "@/three/self-image-loader";

export default {
	name: "LoginPage",
	components: {
		ElForm,
		ElFormItem,
		ElInput,
		ElButton,
	},
	data() {
		return {
			// 初始时不显示右侧区域
			showRightPanel: false,
			buttonMsg: "选择虚拟形象",
			form: {
				username: "",
				password: "",
				email: "",
				selfImage: "",
			},
			formOld: {
				username: "",
				password: "",
				email: "",
				selfImage: "",
			},
		};
	},
	mounted() {
		this.getUserInfo();
		// TODO 测试使用
		this.toggleRightPanel();
	},
	methods: {
		handleSubmit () {
			const username_check = CHECK.checkUsername(this.form.username);
			if (!username_check.pass) {
				ElMessage({
					message: username_check.msg,
					type: "error",
				});
				return;
			}
			const password_check = CHECK.checkPassword(this.form.password);
			if (!password_check.pass) {
				ElMessage({
					message: password_check.msg,
					type: "error",
				});
				return;
			}
			const email_check = CHECK.checkEmail(this.form.email);
			if (!email_check.pass) {
				ElMessage({
					message: email_check.msg,
					type: "error",
				});
				return;
			}
			// TODO 调用 API 更新用户信息
			console.log(this.form);
			ElMessage({
				message: "更新成功",
				type: "success",
			});
		},
		handleReset () {
			this.form = deepCopy(this.formOld);
		},
		getUserInfo () {
			// TODO 调用 API 获取用户信息
			const userData = {
				username: "admin",
				password: "123456",
				email: "23@qq.com",
				selfImage: "/云堇/云堇.pmx"
			};
			this.formOld = deepCopy(userData);
			this.form = deepCopy(userData);
			// this.formOld = {
			// 	username: userData.username,
			// 	password: userData.password,
			// 	email: userData.email,
			// 	selfImage: "/云堇/云堇.pmx"
			// };
		},
		toggleRightPanel() {
			if (!this.showRightPanel) {
				this.buttonMsg = "隐藏虚拟信息选择";
				this.showModels();
				this.showRightPanel = !this.showRightPanel;
			} else {
				this.buttonMsg = "选择虚拟形象";
			}
		},
		showModels(){
			const canvas = document.querySelector("#image1");
			loadAndShowWithoutControl(canvas, '/云堇/云堇.pmx',
				canvas.width + 210, canvas.height + 1200);
			const canvas2 = document.querySelector("#image2");
			loadAndShowWithoutControl(canvas2, '/万叶/万叶.pmx',
				canvas2.width + 210, canvas2.height + 1200);
			const canvas3 = document.querySelector("#image3");
			loadAndShowWithoutControl(canvas3, '/那维莱特/那维莱特.pmx'
				, canvas3.width + 210, canvas3.height + 1200);
		}
	},
};

</script>

<template>
	<div id="container">
		<!--	左右分屏展示：左边个人信息，右边虚拟形象	-->
		<div class="left">
			<div class="user-profile">
				<el-form :model="form" label-width="auto" size="large" label-position="left" >
					<el-form-item label="用户名">
						<el-input v-model="form.username" placeholder="请输入用户名" autocomplete="off"/>
					</el-form-item>
					<el-form-item label="密码">
						<el-input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="off"/>
					</el-form-item>
					<el-form-item label="邮箱">
						<el-input v-model="form.email" placeholder="请输入邮箱"/>
					</el-form-item>
					<el-form-item label="虚拟形象">
						<div class="btn-container">
							<div class="btn-content" @click="toggleRightPanel">
								<span class="btn-title">{{buttonMsg}}</span>
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
						<el-button type="primary" @click="handleSubmit">提交</el-button>
						<el-button @click="handleReset">重置</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>
		<div class="right" v-show="showRightPanel">
			<div class="image-container">
				<div class="canvas-container">
					<canvas class="image-canvas" id="image1"/>
				</div>
				<div class="canvas-container">
					<canvas class="image-canvas" id="image2"/>
				</div>
				<div class="canvas-container">
					<canvas class="image-canvas" id="image3"/>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
#container {
	height: 100vh;
	background-color: var(--background-color);
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	transition: width 0.5s ease-in-out;
	overflow: hidden;
	width: 100%;
}

.left {
	min-width: 30%;
	height: 100%;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}
.right {
	min-width: 70%;
	height: 100%;
	background-color:  var(--background-color);
	overflow: hidden;
}

.image-container {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
.canvas-container {
	width: 33%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
.image-canvas {
	width: 100%;
	height: 100%;
}
.user-profile {
	max-width: 500px;
	margin: auto;
}
.form-label {
	font-family: 'Poppins', sans-serif;
	font-size: 20px;
}
/* 选择虚拟形象的 button*/
.btn-container {
	width: 300px;
	height: 40px;
	display: flex;
	justify-content: center;
	--color-text: #ffffff;
	--color-background: var(--primary-color);
	--color-outline: var(--primary-color-2);
	--color-shadow: #00000080;
}

.btn-content {
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

.btn-content:hover, .btn-content:focus {
	transition: 0.5s;
	-webkit-animation: btn-content 1s;
	animation: btn-content 1s;
	outline: 0.1em solid transparent;
	outline-offset: 0.2em;
	box-shadow: 0 0 0.4em 0 var(--color-background);
}

.btn-content .icon-arrow {
	transition: 0.5s;
	margin-right: 0;
	transform: scale(0.6);
}

.btn-content:hover .icon-arrow {
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

.btn-content:hover #arrow-icon-three {
	animation: color_anim 1s infinite 0.2s;
}

.btn-content:hover #arrow-icon-one {
	transform: translateX(0%);
	animation: color_anim 1s infinite 0.6s;
}

.btn-content:hover #arrow-icon-two {
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
