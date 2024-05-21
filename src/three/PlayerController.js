import * as THREE from "three";

export default class PlayerController {
	constructor(player, controllerElement) {
		// 按键是否按下
		this.keyStates = {
			W: false,
			A: false,
			S: false,
			D: false,
		};

		// 控制的玩家角色
		this.player = player;
		// 控制器作用的容器
		this.controllerElement = controllerElement;

		this.camera = null;
		this.cameraGroup = null;
		this.cameras = {};

		// 用三维向量表示玩家角色(人)运动漫游速度，初始速度设置为0
		this.v = new THREE.Vector3(0, 0, 0);
		//加速度：调节按键加速快慢
		this.a = 400;
		//速度上限
		this.vMax = 1000;
		//阻尼 当没有WASD加速的时候，角色慢慢减速停下来
		this.damping = -0.04;

		// 控制 第一、三人称
		this.firstView = false;

		// 旋转灵敏度
		this.sensitivity = 600;
		// 上下俯仰角度范围
		this.angleMin = THREE.MathUtils.degToRad(-25);//角度转弧度
		this.angleMax = THREE.MathUtils.degToRad(25);

		this.createCameras();
		this.addKeyListeners();
		this.addMouseListeners();
	}

	createCameras() {
		// 创建多个相机
		// 层级关系： player <-- cameraGroup <-- camera(多个)
		this.cameraGroup = new THREE.Group();

		this.firstViewCamera = new THREE.PerspectiveCamera(
			45, window.innerWidth / window.innerHeight, 10, 200000
		);
		this.firstViewCamera.position.set(0, 300, 100);
		this.firstViewCamera.lookAt(0, 300, 120);

		this.thirdViewCamera = new THREE.PerspectiveCamera(
			45, window.innerWidth / window.innerHeight, 10, 200000
		);
		this.thirdViewCamera.position.set(0, 300, -1050);
		this.thirdViewCamera.lookAt(0,300,2);

		this.cameras = {
			firstViewCamera: this.firstViewCamera,
			thirdViewCamera: this.thirdViewCamera
		};
		// 将相机添加到相机组
		for (let key in this.cameras) {
			this.cameraGroup.add(this.cameras[key]);
		}
		this.activeCamera = this.firstView ? this.firstViewCamera : this.thirdViewCamera;
		this.player.object.add(this.cameraGroup);
	}

	set activeCamera(camera) {
		this.cameras.active = camera;
		this.camera = camera;
	}

	get activeCamera() {
		return this.cameras.active;
	}

	addKeyListeners() {
		document.addEventListener('keydown', (e) => {
			console.log(e.key);
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
			case "v":
				this.firstView = !this.firstView;
				this.activeCamera = this.firstView ? this.firstViewCamera : this.thirdViewCamera;
				break;
			case "e":
				this.player.action = 'Pointing';
				this.player.socketOnLocalUpdate();
				break;
			case "q":
				this.player.action = 'Pointing Gesture';
				this.player.socketOnLocalUpdate();
				break;
			}
			// this.playerControl((this.keyStates.W ? 1 : 0) - (this.keyStates.S ? 1 : 0), (this.keyStates.A ? 1 : 0) - (this.keyStates.D ? 1 : 0));
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
			// this.playerControl((this.keyStates.W ? 1 : 0) - (this.keyStates.S ? 1 : 0), (this.keyStates.A ? 1 : 0) - (this.keyStates.D ? 1 : 0));
		});
	}

	addMouseListeners() {
		if (this.controllerElement) {
			if (document.body.contains(this.controllerElement)){
				this.controllerElement.addEventListener('click', () => {
					if (this.controllerElement) {
						if (document.body.contains(this.controllerElement)) {
							this.controllerElement.requestPointerLock();//指针锁定
						}
					}
				});
			}
		}
		document.addEventListener('mousemove', (event) => {
			// 进入指针模式后，才能根据鼠标位置控制人旋转
			if (document.pointerLockElement !== this.controllerElement) return;
			// 左右旋转
			this.player.object.rotation.y -= event.movementX / this.sensitivity;
			// 鼠标上下滑动，让相机视线上下转动
			// 相机父对象cameraGroup绕着x轴旋转,camera跟着转动
			this.cameraGroup.rotation.x += event.movementY / this.sensitivity;
			// 如果 .rotation.x 小于angleMin，就设置为angleMin
			if (this.cameraGroup.rotation.x < this.angleMin) {
				this.cameraGroup.rotation.x = this.angleMin;
			}
			// 如果 .rotation.x 大于angleMax，就设置为angleMax
			if (this.cameraGroup.rotation.x > this.angleMax) {
				this.cameraGroup.rotation.x = this.angleMax;
			}
		});
	}

	// TODO 弃用
	playerControl(forward, turn) {
		turn = -turn;

		if (forward > 0.3) {
			if (this.player.action !== 'Walking' && this.player.action !== 'Running') {
				this.player.action = 'Walking';
			}
		} else if (forward < -0.3) {
			if (this.player.action !== 'Walking Backwards') {
				this.player.action = 'Walking Backwards';
			}
		} else {
			forward = 0;
			if (Math.abs(turn) > 0.1) {
				if (this.player.action !== 'Turn') this.player.action = 'Turn';
			} else if (this.player.action !== "Idle") {
				this.player.action = 'Idle';
			}
		}

		if (forward === 0 && turn === 0) {
			delete this.player.motion;
		} else {
			this.player.motion = { forward, turn };
		}

		// this.player.updateSocket();
	}

	update(deltaTime) {
		if (this.v.length() < this.vMax) { // 限制最高速度
			const front = new THREE.Vector3();
			this.player.object.getWorldDirection(front); // 获取玩家角色的前方向
			const up = new THREE.Vector3(0, 1, 0);//y方向
			const left = up.clone().cross(front);
			if (this.keyStates.W) {
				// W键按下时候，速度随着时间增加
				this.v.add(front.multiplyScalar(this.a * deltaTime));
			}
			if (this.keyStates.S) {
				// S键按下时候，速度随着时间增加
				this.v.add(front.multiplyScalar(- this.a * deltaTime));
			}
			if (this.keyStates.A) {
				this.v.add(left.multiplyScalar(this.a * deltaTime));
			}
			if (this.keyStates.D) {
				this.v.add(left.multiplyScalar(- this.a * deltaTime));
			}
		}
		if (!this.keyStates.W && !this.keyStates.S && !this.keyStates.A && !this.keyStates.D) {
			// 没有按下WASD键时候，速度逐渐减小
			// 阻尼减速
			// v*(1 + damping) = v* (1 - 0.04) = v * 0.96
			// 多次循环乘以0.96(v*0.96*0.96*0.96...),v就会无限逼近于0。
			// v*(1 + damping) = v + v * damping
			this.v.addScaledVector(this.v, this.damping);//速度衰减
		}
		const vl = this.v.length();
		if (vl < 20) {
			this.player.action = "Idle";
		} else if (vl <= 200) {
			this.player.action = "Walking";
		} else {
			this.player.action = "Running";
		}
		// 在间隔deltaTime时间内，玩家角色位移变化计算(速度*时间)
		// 当v为0，位置更新不会变化
		const deltaPos = this.v.clone().multiplyScalar(deltaTime);
		this.player.object.position.add(deltaPos);//更新玩家角色的位置
		// 更新 socket 信息
		this.player.socketOnLocalUpdate();
	}
}