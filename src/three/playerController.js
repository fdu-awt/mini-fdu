import * as THREE from "three";

export default class PlayerController {
	constructor() {
		// 按键是否按下
		this.keyStates = {
			W: false,
			A: false,
			S: false,
			D: false,
		};
		// 鼠标左键是否按下
		this.leftButtonBool = false;
		// 控制的玩家角色
		this.player = null;
		// 用三维向量表示玩家角色(人)运动漫游速度
		this.v = new THREE.Vector3(0, 0, 100); //初始速度设置为0
		this.a = 20; //加速度：调节按键加速快慢
		this.vMax = 100; //速度上限
		this.damping = -0.04; //阻尼 当没有WASD加速的时候，人、车等玩家角色慢慢减速停下来

		this.addKeyListeners();
		this.addMouseListeners();
	}

	addKeyListeners() {
		document.addEventListener('keydown', (e) => {
			switch (e.key) {
			case "w":
				this.keyStates.W = true;
				break;
			case "a":
				this.keyStates.A = true;
				break;
			case "s":
				this.keyStates.S = true;
				break;
			case "d":
				this.keyStates.D = true;
				break;
			}
		});
		document.addEventListener('keyup', (e) => {
			switch (e.key) {
			case "w":
				this.keyStates.W = false;
				break;
			case "a":
				this.keyStates.A = false;
				break;
			case "s":
				this.keyStates.S = false;
				break;
			case "d":
				this.keyStates.D = false;
				break;
			}
		});
	}

	addMouseListeners() {
		document.addEventListener('mousedown', () => {
			this.leftButtonBool = true;
		});
		document.addEventListener('mouseup', () => {
			this.leftButtonBool = false;
		});
		document.addEventListener('mousemove', (event) => {
			//鼠标左键按下时候，才旋转玩家角色
			if (this.leftButtonBool) {
				this.player.rotation.y -= event.movementX / 600;
			}
		});
	}

	update(deltaTime) {
		if (this.keyStates.W) {
			// W键按下时候，速度随着时间增加
			if (this.v.length() < this.vMax) { // 限制最高速度
				//先假设W键对应运动方向为z
				const front = new THREE.Vector3(0, 0, 1);
				this.player.getWorldDirection(front); // 获取玩家角色的前方向
				this.v.add(front.multiplyScalar(this.a * deltaTime));
			}
		}
		if (this.keyStates.S) {
			// S键按下时候，速度随着时间增加
			if (this.v.length() < this.vMax) { // 限制最高速度
				const back = new THREE.Vector3(0, 0, -1);
				this.player.getWorldDirection(back); // 获取玩家角色的后方向
				this.v.add(back.multiplyScalar(this.a * deltaTime));
			}
		}
		// 阻尼减速
		// v*(1 + damping) = v* (1 - 0.04) = v * 0.96
		// 多次循环乘以0.96(v*0.96*0.96*0.96...),v就会无限逼近于0。
		// v*(1 + damping) = v + v * damping
		this.v.addScaledVector(this.v, this.damping);//速度衰减

		// 在间隔deltaTime时间内，玩家角色位移变化计算(速度*时间)
		// 当v是0的时候，位置更新也不会变化
		const deltaPos = this.v.clone().multiplyScalar(deltaTime);
		this.player.position.add(deltaPos);//更新玩家角色的位置
	}
}