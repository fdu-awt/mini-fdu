<script>
import { ElMessage, ElForm, ElFormItem, ElInput, ElSelect,ElOption} from 'element-plus';
import * as CHECK from "@/utils/check";
import {deepCopy} from "@/utils/copy";
import {initializeScene, loadWithModel} from "@/three/self-image-loader";
import { getUserInfo, modifyUserInfo } from "@/api/user";

export default {
	name: "LoginPage",
	components: {
		ElForm,
		ElFormItem,
		ElInput,
		ElSelect,
		ElOption
	},
	data() {
		return {
			buttonMsg: "选择虚拟形象",
			selfImageChoice: [
				{
					name: "万叶",
					path: "/万叶/万叶.pmx",
				},
				{
					name: "云堇",
					path: "/云堇/云堇.pmx",
				},
				{
					name: "五郎",
					path: "/五郎/五郎.pmx",
				},
				{
					name: "千织",
					path: "/千织/千织.pmx",
				},
				{
					name: "多莉",
					path: "/多莉/多莉.pmx",
				},
				{
					name: "烟绯",
					path: "/烟绯/烟绯.pmx",
				},
				{
					name: "芭芭拉",
					path: "/芭芭拉/芭芭拉.pmx",
				},
				{
					name: "荒泷一斗",
					path: "/荒泷一斗/荒泷一斗.pmx",
				},
				{
					name: "行秋",
					path: "/行秋/行秋.pmx",
				},
				{
					name: "那维莱特",
					path: "/那维莱特/那维莱特.pmx",
				},
			],
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
			const password_check = CHECK.checkPassword(this.form.password);
			if (!password_check.pass) {
				ElMessage({
					showClose: true,
					message: password_check.msg,
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
			modifyUserInfo(this.form.username,this.form.password,this.form.email,this.form.selfImage).then((res) => {
				if (res.data.code === 200) {
					this.formOld = deepCopy(this.form);
					ElMessage({
						showClose: true,
						message: res.data.msg,
						type: "success",
					});
				} else {
					ElMessage({
						showClose: true,
						message: res.data.msg,
						type: "error",
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
			getUserInfo().then((res) => {
				if (res.data.code === 200) {
					this.form = res.data;
					this.formOld = deepCopy(res.data);
					this.showModel();
				} else {
					ElMessage({
						showClose: true,
						message: res.data.msg,
						type: "error",
					});
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		showModel(){
			const path = this.form.selfImage;
			if (path !== "") {
				const canvas_container = document.querySelector("#canvas-container");
				const canvas = document.querySelector("#image");
				const width = canvas_container.clientWidth;
				const height = canvas_container.clientHeight;
				initializeScene(canvas, width, height);
				loadWithModel(path, width, height);
			}
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
						<el-select
								v-model="form.selfImage"
								@change="showModel"
								filterable
								placeholder="请选择虚拟形象">
							<el-option
									v-for="item in selfImageChoice"
									:key="item.path"
									:label="item.name"
									:value="item.path">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<div class="btn-container">
							<div class="btn-content" @click="handleSubmit">
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
				</el-form>
			</div>
		</div>
		<div class="right">
			<div id="canvas-container">
				<canvas id="image"/>
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
.user-profile {
	max-width: 500px;
	margin: auto;
}
.right {
	min-width: 70%;
	height: 100%;
	background-color: #eee;
}

#canvas-container {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

/* 用于提交的 button*/
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
