import {FBX_IMAGE} from "@/three/self-image/self-image";
import * as THREE from 'three';
import PlayerController from "@/three/PlayerController";
import {Town} from "@/three/GameEnvironment";
import {FbxSelfImageLoader} from "@/three/SelfImageLoader";
import {Preloader} from "@/utils/preloader";
import GameWebSocketService, {GAME_WS_EMIT_EVENTS, GAME_WS_MSG_TYPES} from "@/api/socket/GameWebSocketService";
import gameEventEmitter, {GAME_EVENTS} from "@/event/GameEventEmitter";
import STORAGE from "@/store";
// import { ElMessage } from "element-plus";

export class Game {
	/**
	 * @param {HTMLElement} container
	 * @param {GameEnvironment} environment
	 * @param {SelfImageLoader} selfImageLoader
	 * */
	constructor(container, environment, selfImageLoader) {
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
		this.environment = environment || new Town();
		this.selfImageLoader = selfImageLoader || new FbxSelfImageLoader();
		this.player = null;
		this.renderer = null;
		this.remoteData = [];
		this.initialisingPlayers = [];
		this.remotePlayers = [];

		this.clock = new THREE.Clock();
		this.playerController = null;

		this.colliders = [];
		this.remoteColliders = [];

		this.post = [];

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

		this.player = new PlayerLocal(this, STORAGE.getSelfImage(), STORAGE.getUserId());

		this.environment.load(this, undefined);
		this.bindEventsForPosts(this);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,  // 抗锯齿
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild(this.renderer.domElement);
	}

	bindEventsForPosts(game){
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		function onMouseClick(event) {
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			
			if(game.playerController!=undefined){
				raycaster.setFromCamera(mouse, game.playerController.camera);
				const intersects = raycaster.intersectObjects(game.scene.children, true);

				console.log("intersects", intersects);
				if(intersects.length > 0){
					// ElMessage({
					// 	showClose: true,
					// 	message: intersects[0].object.name,
					// 	type: "success",
					// });
					if(intersects[0].object.name.startsWith("post")){
						// const post = intersects[0].object;
						// post.material = new THREE.MeshBasicMaterial({ 
						// 	color: 0xff0000,
						// 	side: THREE.DoubleSide,
						// });
						
						const post_id = Number(intersects[0].object.name.substring(4));
						let event = new Event("ClickPost");
						event.key = post_id;
						window.dispatchEvent(event);
					}					
				}
			}
		}

		window.addEventListener("click", onMouseClick, false);
	}

	updateRemotePlayers(dt){
		// 检查是否有远程数据、LocalPlayer 玩家对象以及 LocalPlayer 的 userId 是否存在。
		// 如果没有，则直接返回，不做任何更新。
		if (this.remoteData===undefined || this.remoteData.length === 0
			|| this.player===undefined || this.player.userId===undefined){
			return;
		}
		const game = this;
		//Get all remotePlayers from remoteData array
		// 用于存储更新后 的远程玩家
		const remotePlayers = [];
		// 用于存储更新后 远程玩家的碰撞体
		const remoteColliders = [];

		this.remoteData.forEach( function(data){
			// 忽略本地玩家
			if (game.player.userId === data.userId){
				return;
			}
			// 查找当前远程玩家是否处于初始化中
			let iPlayer;
			game.initialisingPlayers.forEach( function(player){
				if (player.userId === data.userId) iPlayer = player;
			});
			// 如果处于初始化中，则返回
			if (iPlayer!==undefined) return;
			// 查找当前远程玩家是否已经存在
			let rPlayer;
			game.remotePlayers.forEach( function(player){
				if (player.userId === data.userId) rPlayer = player;
			});
			// 如果不存在，则初始化远程玩家
			if (rPlayer===undefined){
				console.log("远程玩家不存在，初始化远程玩家");
				console.log(data);
				game.initialisingPlayers.push( new Player(game, data.model, data.colour, data.userId, false));
			} else {
				// 远程玩家已经存在，则加入到 remotePlayers 数组中，之后进行更新
				remotePlayers.push(rPlayer);
				remoteColliders.push(rPlayer.collider);
			}
		});

		// 清理不再存在的远程玩家
		this.scene.children.forEach( function(object){
			if (object.userData.remotePlayer &&
				game.getRemotePlayerById(object.userData.userId) === undefined){
				game.scene.remove(object);
			}
		});

		// 使用上面筛选的远程玩家和碰撞体更新远程玩家和碰撞体数组
		// 仅包含：已经存在、未处于初始化 的 远程玩家 与 其对应的碰撞体
		this.remotePlayers = remotePlayers;
		this.remoteColliders = remoteColliders;
		// 更新每个远程玩家
		this.remotePlayers.forEach(function(player){ player.update( dt ); });
	}

	getRemotePlayerById(id){
		if (this.remotePlayers===undefined || this.remotePlayers.length===0) return;

		const players = this.remotePlayers.filter(function(player){
			if (player.userId === id) return true;
		});

		if (players.length===0) return;

		return players[0];
	}

	removePlayer(player){
		this.scene.remove(player.object);
		this.remotePlayers.splice(this.remotePlayers.indexOf(player), 1);
		this.remoteColliders.splice(this.remoteColliders.indexOf(player.collider), 1);
	}

	removePlayers(deletedPlayerUserId){
		// 已经初始化的远程玩家
		const players = this.remotePlayers.filter(function(player){
			if (player.userId === deletedPlayerUserId) return true;
		});
		players.forEach((player) => {
			this.scene.remove(player.object);
			this.remotePlayers.splice(this.remotePlayers.indexOf(player), 1);
			this.remoteColliders.splice(this.remoteColliders.indexOf(player.collider), 1);
		});
		// 处于初始化中的远程玩家
		const iPlayers = this.initialisingPlayers.filter(function(player){
			if (player.userId === deletedPlayerUserId) return true;
		});
		iPlayers.forEach((player) => {
			this.scene.remove(player.object);
			this.initialisingPlayers.splice(this.initialisingPlayers.indexOf(player), 1);
		});
	}

	animate() {
		const dt = this.clock.getDelta();
		requestAnimationFrame(this.animate.bind(this));

		this.updateRemotePlayers(dt);

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
}

class Player {
	static anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];
	static modes = Object.freeze({
		INIT: Symbol("init"),
		CHANGING: Symbol("changing"),
		ACTIVE: Symbol("active"),
	});

	constructor(game, model, colour, userId, local) {
		this.mode = Player.modes.INIT;
		this.game = game;
		this.model = model;
		this.colour = colour;
		this.userId = userId;
		this.local = local;

		this.mixer = null;
		this.actionObjs = {};
		this.activeAction = null;
		this.activateActionName = null;
		if (this.userId === undefined || this.userId === '') {
			if (this.local) {
				gameEventEmitter.emit(GAME_EVENTS.NO_LOCAL_USER_ID, "No user ID, maybe not logged in.");
			} else {
				console.error("No user ID for remote player");
			}
			return;
		}
		this.loadModel(this.model, this.colour);
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

	loadModel(modelName, colour) {
		const game = this.game;
		const player = this;
		// 加载新模型
		game.selfImageLoader.load(modelName, colour).then((object) => {
			player.mixer = object.mixer;
			player.object = new THREE.Object3D();
			player.object.position.set(3122, 0, -173);
			player.object.rotation.set(0, 2.6, 0);
			player.object.add(object);
			game.scene.add(player.object);
			if (player.local) {
				game.playerController = new PlayerController(player, game.container);
				game.sun.target = game.player.object;
			} else {
				console.log("Load new remote player: " + player.userId);
				const geometry = new THREE.BoxGeometry(100,300,100);
				const material = new THREE.MeshBasicMaterial({visible:false});
				const box = new THREE.Mesh(geometry, material);
				box.name = "Collider";
				box.position.set(0, 150, 0);
				player.object.add(box);
				player.collider = box;
				player.object.userData.userId = player.userId;
				player.object.userData.remotePlayer = true;
				const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(this), 1);
				game.remotePlayers.push(players[0]);
			}
			player.loadAnimations(game.selfImageLoader.getOriginalLoader());
			player.mode = Player.modes.ACTIVE;
			const clip = object.animations[0];
			const action = player.mixer.clipAction(clip);
			action.name = "Idle";
			action.weight = 1.0;
			player.actionObjs.Idle = action;
			player.activeAction = action;
			action.play();
			player.action = "Idle";
		}).then(() => {
		}).catch((error) => {
			console.error("Player.loadModel: " + error);
		});
	}

	changeModel(modelName, colour) {
		// 移除旧模型
		this.game.scene.remove(this.object);
		this.loadModel(modelName, colour);
		if (this.local) {
			this.socketOnLocalUpdate();
		}
	}

	set action(name) {
		if (this.mode === Player.modes.INIT || this.mode === Player.modes.CHANGING) {
			return;
		}
		if (!this.actionObjs[name]) {
			console.error("Invalid action name: " + name);
			return;
		}
		if (this.activateActionName === name) {
			return;
		}
		if (this.activeAction) {
			this.activeAction.weight = 0.0;
			this.activeAction = this.actionObjs[name];
			this.activeAction.weight = 1.0;
			this.activateActionName = name;
		} else {
			console.error("this.activeAction is undefined.");
		}
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

	/**
	 * 用于 remotePlayer
	 * */
	update(dt){
		this.mixer.update(dt);
		if (this.game.remoteData.length>0){
			let found = false;
			for(let data of this.game.remoteData){
				if (data.userId !== this.userId) continue;
				//Found the player
				const model = data.model;
				const colour = data.colour;
				// console.log(`Player.update: ${model}, ${colour}`);
				if (model !== this.model || colour !== this.colour){
					// 如果模型或颜色发生变化，则更新模型
					this.changeModel(model, colour);
				} else {
					// 否则更新位置、朝向和动作
					this.object.position.set( data.x, data.y, data.z );
					const euler = new THREE.Euler(data.pb, data.h, data.pb);
					this.object.quaternion.setFromEuler( euler );
					this.action = data.action;
				}
				found = true;
			}
			if (!found) this.game.removePlayer(this);
		}
	}
}

class PlayerLocal extends Player {
	constructor(game, model, userId) {
		super(game, model, FBX_IMAGE.randomColour(), userId, true);
		this.initWebSocket();
	}

	initWebSocket(){
		this.gameWebSocketService = new GameWebSocketService();
		this.gameWebSocketService.connect(this.userId);
		this.gameWebSocketService.onMessage(GAME_WS_MSG_TYPES.REMOTE_DATA, (message) => {
			this.game.remoteData = message.data;
		});
		this.gameWebSocketService.onMessage(GAME_WS_MSG_TYPES.REMOTE_PLAYER_DELETED, (message) => {
			const deletedUserId = message.userId;
			this.game.removePlayers(deletedUserId);
		});
	}

	socketOnLocalUpdate(){
		if (this.gameWebSocketService !== undefined){
			const data = {
				userId: this.userId,
				model: this.model,
				colour: this.colour,
				x: this.object.position.x,
				y: this.object.position.y,
				z: this.object.position.z,
				h: this.object.rotation.y,
				pb: this.object.rotation.x,
				action: this.action
			};
			this.gameWebSocketService.gameEmit(GAME_WS_EMIT_EVENTS.LOCAL_UPDATE, data);
		}
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