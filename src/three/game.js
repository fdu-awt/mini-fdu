import SELF_IMAGE, {FBX_IMAGE} from "@/three/self-image/self-image";
import * as THREE from 'three';
import {FBXLoader, OrbitControls} from "three/addons";
import PlayerController from "@/three/PlayerController";
import {Preloader} from "@/utils/preloader";

export class Game {
	constructor(container) {
		this.modes = Object.freeze({
			NONE: Symbol("none"),
			PRELOAD: Symbol("preload"),
			INITIALISING: Symbol("initialising"),
			CREATING_LEVEL: Symbol("creating_level"),
			ACTIVE: Symbol("active"),
			GAME_OVER: Symbol("game_over")
		});
		this.mode = this.modes.NONE;
		this.container = container;

		this.scene = null;
		this.environment = new Town(this);
		this.player = null;
		this.renderer = null;

		this.clock = new THREE.Clock();
		this.playerController = null;

		this.colliders = [];
		this.remoteColliders = [];

		this.preload();
	}

	preload() {
		const game = this;
		const options = {
			assets: [
				`${FBX_IMAGE.CUBE_TEXTURE_PATH}/nx.jpg`,
				`${FBX_IMAGE.CUBE_TEXTURE_PATH}/px.jpg`,
				`${FBX_IMAGE.CUBE_TEXTURE_PATH}/ny.jpg`,
				`${FBX_IMAGE.CUBE_TEXTURE_PATH}/py.jpg`,
				`${FBX_IMAGE.CUBE_TEXTURE_PATH}/nz.jpg`,
				`${FBX_IMAGE.CUBE_TEXTURE_PATH}/pz.jpg`,
			],
			oncomplete: function () {
				game.init();
			}
		};
		Player.anims.forEach((anim) => {
			options.assets.push(FBX_IMAGE.getAnimPath(anim));
		});
		options.assets.push(FBX_IMAGE.SCENE_PATH);

		this.mode = this.modes.PRELOAD;
		new Preloader(options);
	}

	init() {
		this.mode = this.modes.INITIALISING;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x00a0f0);

		// 添加雾效
		// 设置指数雾的参数
		const fogColor = 0xecbd67;  // 雾的颜色，与天空盒子的颜色相同
		const fogDensity = 0.00025; // 雾的密度
		// 创建指数雾并添加到场景
		this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);

		const ambient = new THREE.AmbientLight(0xaaaaaa);
		this.scene.add(ambient);

		const light = new THREE.DirectionalLight(0xaaaaaa);
		light.position.set(30, 100, 40);
		light.target.position.set(0, 0, 0);

		light.castShadow = true;

		const lightSize = 500;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 500;
		light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
		light.shadow.camera.right = light.shadow.camera.top = lightSize;

		light.shadow.bias = 0.0039;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;

		this.sun = light;
		this.scene.add(light);

		this.player = new PlayerLocal(this);

		this.environment.load();

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,  // 抗锯齿
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild(this.renderer.domElement);
	}

	animate() {
		const dt = this.clock.getDelta();
		requestAnimationFrame(this.animate.bind(this));
		if (this.player.mixer !== undefined
			&& this.mode === this.modes.ACTIVE) {
			this.player.mixer.update(dt);
		}
		if (this.sun !== undefined) {
			this.sun.position.copy(this.playerController.activeCamera.position);
			this.sun.position.y += 10;
		}
		if (this.playerController) {
			this.playerController.update(dt);
		}
		this.renderer.render(this.scene, this.playerController.activeCamera);
	}

	/**
	 * @description 初始化Three.js
	 * @param {HTMLCanvasElement} canvas 画布
	 * */
	static initializeThreeScene(canvas) {
		// 创建场景
		const scene = new THREE.Scene();
		scene.background = new THREE.Color('#eee');

		// 创建渲染器
		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true // 抗锯齿
		});
		renderer.shadowMap.enabled = true;

		// 创建相机
		const camera = new THREE.PerspectiveCamera(
			70, // FOV 视场角
			window.innerWidth / window.innerHeight, // 纵横比（aspect）
			0.1, // near 和 far 近剪裁面和远剪裁面定义了可视范围的深度
			1000
		);
		camera.position.set(0, 1.6, -35);//玩家角色后面一点
		camera.lookAt(0, 1.6, 0);//对着人身上某个点  视线大致沿着人的正前方

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		// 全局光源设置
		// 创建半球光
		const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
		hemLight.position.set(0, 50, 0);
		scene.add(hemLight);

		// 创建定向光
		const dirLight =
			new THREE.DirectionalLight(0xffffff, 2.4);
		// 设置光源位置
		dirLight.position.set(0, 20, 20);
		// 启用阴影
		dirLight.castShadow = true;
		dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
		scene.add(dirLight);
		return {scene, renderer, camera, controls, hemLight, dirLight};
	}
}

class Environment {
	constructor(game) {
		this.game = game;
	}

	load() {
	}
}

class Town extends Environment {
	constructor(game) {
		super(game);
	}

	load() {
		const game = this.game;
		const loader = new FBXLoader();
		loader.load(FBX_IMAGE.SCENE_PATH, function (object) {
			game.scene.add(object);
			object.traverse(function (child) {
				if (child.isMesh) {
					if (child.name.startsWith("proxy")) {
						game.colliders.push(child);
						child.material.visible = false;
					} else {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				}
			});
			const cubeTextureLoader = new THREE.CubeTextureLoader();
			cubeTextureLoader.setPath(FBX_IMAGE.CUBE_TEXTURE_PATH);
			game.scene.background = cubeTextureLoader.load([
				'px.jpg', 'nx.jpg',
				'py.jpg', 'ny.jpg',
				'pz.jpg', 'nz.jpg'
			]);
		});
	}
}

class Player {
	static anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];
	static modes = Object.freeze({
		INIT: Symbol("init"),
		CHANGING: Symbol("changing"),
		ACTIVE: Symbol("active"),
	});
	constructor(game) {
		this.mode = Player.modes.INIT;
		this.local = true;
		this.game = game;

		this.mixer = null;
		this.actionObjs = {};
		this.activeAction = null;
		this.activateActionName = null;

		this.loadModel(SELF_IMAGE.getModelName());
	}

	loadAnimations(loader) {
		const player = this;
		const game = this.game;
		Player.anims.forEach((anim) => {
			loader.load(FBX_IMAGE.getAnimPath(anim), function (object) {
				const clip = object.animations[0];
				// clip生成action
				const action = player.mixer.clipAction(clip);
				action.name = anim;
				action.weight = 0.0;
				player.actionObjs[anim] = action;
				action.play();
			});
		});
		game.mode = game.modes.ACTIVE;
		game.animate();
	}

	loadModel(modelName) {
		const game = this.game;
		const player = this;
		// 加载新模型
		const loader = new FBXLoader();
		const modelPath = FBX_IMAGE.getModelPathByName(modelName);
		loader.load(modelPath, function (object) {
			object.mixer = new THREE.AnimationMixer(object);
			player.mixer = object.mixer;

			object.name = "Person";
			object.traverse(function (child) {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
			const textureLoader = new THREE.TextureLoader();
			textureLoader.load(FBX_IMAGE.getTexturePath(modelName, FBX_IMAGE.randomColour()), function (texture) {
				object.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = texture;
					}
				});
			});
			player.object = new THREE.Object3D();
			player.object.position.set(3122, 0, -173);
			player.object.rotation.set(0, 2.6, 0);
			player.object.add(object);
			game.scene.add(player.object);
			if (player.local) {
				game.playerController = new PlayerController(player);
				game.sun.target = game.player.object;
				const clip = object.animations[0];
				const action = player.mixer.clipAction(clip);
				action.name = "Idle";
				action.weight = 1.0;
				player.actionObjs.Idle = action;
				player.activeAction = action;
				action.play();
			} else {
				// TODO 远程 player
			}
			player.loadAnimations(loader);
			player.mode = Player.modes.ACTIVE;
			player.action = "Idle";
		});
	}

	set action(name) {
		if (this.mode === Player.modes.INIT || this.mode === Player.modes.CHANGING) {
			return;
		}
		if (this.activateActionName === name) {
			return;
		}
		this.activeAction.weight = 0.0;
		this.activeAction = this.actionObjs[name];
		this.activeAction.weight = 1.0;
		this.activateActionName = name;
		// 一次性动画
		// if (name === 'Pointing Gesture' || name === 'Pointing') {
		// 	// 设置动画为只播放一次
		// 	action.setLoop(THREE.LoopOnce);
		// 	// 动画播放完成后，将动作设置为Idle
		// 	this.mixer.addEventListener('finished', function () {
		// 		this.action = 'Idle';
		// 		// this.updateSocket(); // 发送动作到服务器
		// 	}.bind(this));
		// }
	}

	get action() {
		return this.activateActionName;
	}
}

class PlayerLocal extends Player {
	constructor(game, model) {
		super(game, model);
	}

	move(dt) {
		const pos = this.object.position.clone();
		pos.y += 60;
		let dir = new THREE.Vector3();
		this.object.getWorldDirection(dir);
		if (this.motion.forward < 0) dir.negate();
		let raycaster = new THREE.Raycaster(pos, dir);
		let blocked = false;
		const colliders = [...this.game.colliders, ...this.game.remoteColliders];

		let intersect = raycaster.intersectObjects(colliders);
		if (intersect.length > 0) {
			if (intersect[0].distance < 50) blocked = true;
		}

		if (!blocked) {
			if (this.motion.forward > 0) {
				const speed = (this.action === 'Running') ? 500 : 150;
				this.object.translateZ(dt * speed);
			} else {
				this.object.translateZ(-dt * 30);
			}
		}

		//cast left
		dir.set(-1, 0, 0);
		dir.applyMatrix4(this.object.matrix);
		dir.normalize();
		raycaster = new THREE.Raycaster(pos, dir);

		intersect = raycaster.intersectObjects(colliders);
		if (intersect.length > 0) {
			if (intersect[0].distance < 50) this.object.translateX(100 - intersect[0].distance);
		}

		//cast right
		dir.set(1, 0, 0);
		dir.applyMatrix4(this.object.matrix);
		dir.normalize();
		raycaster = new THREE.Raycaster(pos, dir);

		intersect = raycaster.intersectObjects(colliders);
		if (intersect.length > 0) {
			if (intersect[0].distance < 50) this.object.translateX(intersect[0].distance - 100);
		}

		//cast down
		dir.set(0, -1, 0);
		pos.y += 200;
		raycaster = new THREE.Raycaster(pos, dir);
		const gravity = 30;

		intersect = raycaster.intersectObjects(colliders);
		if (intersect.length > 0) {
			const targetY = pos.y - intersect[0].distance;
			if (targetY > this.object.position.y) {
				//Going up
				this.object.position.y = 0.8 * this.object.position.y + 0.2 * targetY;
				this.velocityY = 0;
			} else if (targetY < this.object.position.y) {
				//Falling
				if (this.velocityY === undefined) this.velocityY = 0;
				this.velocityY += dt * gravity;
				this.object.position.y -= this.velocityY;
				if (this.object.position.y < targetY) {
					this.velocityY = 0;
					this.object.position.y = targetY;
				}
			}
		}

		this.object.rotateY(this.motion.turn * dt);

		// this.updateSocket();
	}
}