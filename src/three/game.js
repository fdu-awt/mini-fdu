import {FBX_IMAGE} from "@/three/self-image/self-image";
import * as THREE from 'three';
import PlayerController from "@/three/PlayerController";
import {Town} from "@/three/GameEnvironment";
import {FbxSelfImageLoader} from "@/three/SelfImageLoader";
import {Preloader} from "@/utils/preloader";
import GameWebSocketService, {GAME_WS_EMIT_EVENTS, GAME_WS_MSG_TYPES} from "@/api/socket/GameWebSocketService";
import ChatWebSocketService from "@/api/socket/ChatWebSocketService";
import gameEventEmitter, {GAME_EVENTS} from "@/event/GameEventEmitter";
import STORAGE from "@/store";
import gameErrorEventEmitter, {GAME_ERROR_EVENTS} from "@/event/GameErrorEventEmitter";
import {createPlayerNameText} from "@/three/common";
import NPC from "@/three/NPC";
import eventBus from '@/eventbus/eventBus.js';

export class Game {
	static anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];

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
		this.animations = {};
		this.remoteData = [];
		this.initialisingPlayers = [];
		this.remotePlayers = [];

		this.clock = new THREE.Clock();
		this.playerController = null;

		this.colliders = [];
		this.remoteColliders = [];

		this.post = [];
		this.clubs = [];

		// 定义 npc
		// TODO 根据需求定义NPC
		this.npc1 = new NPC(
			this,
			"Doctor",
			FBX_IMAGE.randomColour(),
			"知识自测NPC",
			{x: 3122, y: 0, z: -173,},
			{x: 0, y: 2.6, z: 0,},
			{x: 0, y: 320, z: 0,});
		this.npcs = [this.npc1];

		this.preload();
	}

	handlePlayerClicked(localId, remoteId, socket) {
		const chatEventData = {
			localId: localId,
			remoteId: remoteId,
			socket: socket
		};
		const event = new CustomEvent('ClickPlayer', { detail: chatEventData });
		window.dispatchEvent(event);
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
		Game.anims.forEach((anim) => {
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
		// const fogColor = 0xecbd67;  // 雾的颜色，与天空盒子的颜色相同
		// const fogDensity = 0.00025; // 雾的密度
		// // 创建指数雾并添加到场景
		// this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);

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

		// 创建半球光
		const skyColor = 0x87ceeb; // 天空颜色 (浅蓝色)
		const groundColor = 0x555555; // 地面颜色 (深灰色)
		const intensity = 2; // 光的强度
		const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);

		// 将半球光添加到场景中
		this.scene.add(hemiLight);

		this.environment.load(this, undefined);
		// 加载 npc 和 玩家动画
		this.loadAnimations().then(() => {
			// 加载玩家
			this.player = new PlayerLocal(this, STORAGE.getSelfImage(), STORAGE.getUserId(), STORAGE.getUsername());
			return this.player.loadModel(true);
		}).then(() => {
			// 加载NPC
			const npcPromises = this.npcs.map((npc) => npc.init());
			return Promise.all(npcPromises);
		}).then(() => {
			// 创建渲染器
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,  // 抗锯齿
			});
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.shadowMap.enabled = true;
		}).then(() => {
			// 事件监听
			// 处理：用户选择个人形象
			gameEventEmitter.on(GAME_EVENTS.USER_SELF_IMAGE_CHANGE, (selfImageName) => {
				this.player.changeModel(selfImageName, FBX_IMAGE.randomColour());
			});
			// 处理：键盘事件
			this.listenKeyDown();
			this.listenKeyUp();
		}).then(() => {
			this.container.appendChild(this.renderer.domElement);
			this.animate();
		}).catch((error) => {
			console.error("Game.init: " + error);
		});
	}

	/**
	 * @return Promise
	 */
	loadAnimations() {
		const loader = this.selfImageLoader.getOriginalLoader();
		const game = this;

		const animPromises = Game.anims.map((anim) => {
			return new Promise((resolve, reject) => {
				loader.load(FBX_IMAGE.getAnimPath(anim), function (object) {
					game.animations[anim] = object.animations[0];
					resolve();
				}, undefined, function (error) {
					reject(error);
				});
			});
		});
		return Promise.all(animPromises).then(() => {
			game.mode = game.modes.ACTIVE;
		});
	}

	listenKeyDown(){
		document.addEventListener('keydown', (e) => {
			console.log(e.key);
			switch (e.key) {
			case "w":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_W);
				break;
			case "a":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_A);
				break;
			case "s":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_S);
				break;
			case "d":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_D);
				break;
			case "v":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_V);
				break;
			case "e":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_E);
				break;
			case "q":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_Q);
				break;
			case "z":
				gameEventEmitter.emit(GAME_EVENTS.KEY_DOWN_Z);
				break;
			}
		});
	}
	
	listenKeyUp() {
		document.addEventListener('keyup', (e) => {
			console.log(e.key);
			switch (e.key) {
			case "w":
				gameEventEmitter.emit(GAME_EVENTS.KEY_UP_W);
				break;
			case "a":
				gameEventEmitter.emit(GAME_EVENTS.KEY_UP_A);
				break;
			case "s":
				gameEventEmitter.emit(GAME_EVENTS.KEY_UP_S);
				break;
			case "d":
				gameEventEmitter.emit(GAME_EVENTS.KEY_UP_D);
				break;
			}
		});
	}

	onMouseClick(event) {
		const game = this;
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		if(game.playerController!==undefined){
			raycaster.setFromCamera(mouse, game.playerController.camera);
			const intersects = raycaster.intersectObjects(game.scene.children, true);

			console.log("intersects", intersects);
			let clickNPC = false;
			if(intersects.length > 0){
				const object = intersects[0].object;
				console.log(object.name);

				// 点击历史展板
				if(object.name.startsWith("post")){
					console.log((object.name));
					// const post = intersects[0].object;
					// post.material = new THREE.MeshBasicMaterial({
					// 	color: 0xff0000,
					// 	side: THREE.DoubleSide,
					// });

					const post_id = Number(intersects[0].object.name.substring(4));
					let clickEvent = new Event("ClickPost");
					clickEvent.key = post_id;
					window.dispatchEvent(clickEvent);
				}

				// 点击社团展板
				if(object.name.startsWith("clubpost")){
					const club_id = Number(intersects[0].object.name.substring(8));
					let clickEvent = new Event("ClickClub");
					clickEvent.key = club_id;
					window.dispatchEvent(clickEvent);
				}

				// 点击 NPC
				game.npcs.forEach((npc) => {
					if (npc.collider === object) {
						clickNPC = true;
						npc.interact();
					}
				});

				// 检查是否为点击的玩家
				if (game.remotePlayers.some(player => player.collider === object) && !clickNPC) {
					// 获取被点击玩家的用户ID
					const clickedPlayer = game.remotePlayers.find(player => player.collider === object);
					const clickedPlayerId = clickedPlayer.userId;
					console.log(clickedPlayerId);

					// 检查是否是自己
					if (clickedPlayerId === game.player.userId) {
						return;
					}

					console.log(game.player.userId);
					// 打开聊天界面
					game.handlePlayerClicked(game.player.userId, clickedPlayerId, game.player.chatWebSocketService.socket);
				}
			}
		}
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
				game.initialisingPlayers.push( new Player(game, data.model, data.colour, data.userId, data.username, false));
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
		// 更新 NPC
		this.npcs.forEach(function(npc) {
			npc.update(dt);
		});
		this.renderer.render(this.scene, this.playerController.activeCamera);
	}
}

class Player {
	constructor(game, model, colour, userId, username, local) {
		this.game = game;
		this.model = model;
		this.colour = colour;
		this.userId = userId;
		this.username = username || `Player ${userId}`;
		this.local = local;

		this.mixer = null;
		this.actions = {}; // 存储动画动作
		this.animations = this.game.animations;

		if (this.userId === undefined || this.userId === '') {
			if (this.local) {
				gameErrorEventEmitter.emit(GAME_ERROR_EVENTS.NO_LOCAL_USER_ID, "No user ID, maybe not logged in.");
			} else {
				console.error("No user ID for remote player");
			}
		}
		if (!local){
			this.loadModel().then(() => {
			});
		}
	}

	loadModel(init = true) {
		const modelName = this.model;
		const colour = this.colour;
		const game = this.game;
		const player = this;
		let position;

		// 位置信息
		if (init) {
			position = {
				x: 3122,
				y: 0,
				z: -173,
				h: 2.6,
				pb: 0,
				nameTextPos: {
					x: 0,
					y: 320, // 需要根据模型大小调整
					z: 0,
				},
			};
		} else {
			position = {
				x: this.object.position.x,
				y: this.object.position.y,
				z: this.object.position.z,
				h: this.object.rotation.y,
				pb: this.object.rotation.x,
				nameTextPos: {
					x: 0,
					y: 310, // 需要根据模型大小调整
					z: 0,
				},
			};
		}

		// 返回一个Promise
		return new Promise((resolve, reject) => {
			// 加载新模型
			game.selfImageLoader.load(modelName, colour).then((object) => {
				player.mixer = object.mixer;
				player.object = new THREE.Object3D();
				player.object.position.set(position.x, position.y, position.z);
				player.object.rotation.set(0, position.h, 0);
				player.object.add(object);
				game.scene.add(player.object);

				// 在头顶显示用户名
				const nameText = createPlayerNameText(player.username);
				nameText.position.set(position.nameTextPos.x, position.nameTextPos.y, position.nameTextPos.z); // 设置名字的位置
				player.object.add(nameText);

				if (player.local) {
					game.playerController = new PlayerController(player, game.container);
					game.sun.target = game.player.object;
					game.animations.Idle = object.animations[0];
				} else {
					const geometry = new THREE.BoxGeometry(100, 300, 100);
					const material = new THREE.MeshBasicMaterial({ visible: false });
					const box = new THREE.Mesh(geometry, material);
					box.name = "player-" + player.userId; // 使用用户ID作为名称的一部分
					box.position.set(0, 150, 0);
					player.object.add(box);
					player.collider = box;
					player.object.userData.userId = player.userId;
					player.object.userData.remotePlayer = true;
					if (init) {
						const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(this), 1);
						game.remotePlayers.push(players[0]);
					}
				}
				// 创建每个动画的动作
				for (let animName in game.animations) {
					const clip = game.animations[animName];
					const action = player.mixer.clipAction(clip);
					action.clampWhenFinished = true;
					action.loop = THREE.LoopRepeat;
					player.actions[animName] = action;
				}
				if (game.animations.Idle !== undefined) player.action = "Idle";
				// 解析Promise，表示模型加载完成
				resolve();
			}).catch((error) => {
				console.error("Player.loadModel: " + error);
				// 拒绝Promise，表示加载失败
				reject(error);
			});
		});
	}

	changeModel(modelName, colour) {
		this.model = modelName;
		this.colour = colour;
		// 移除旧模型
		this.game.scene.remove(this.object);
		this.actionName = undefined;
		// 加载新模型
		this.loadModel(false).then(() => {
			if (this.local) {
				this.socketUpdate();
			}
		});
	}

	set action(name) {
		if (this.actionName === name) return;
		const previousAction = this.actions[this.actionName];
		const newAction = this.actions[name];
		this.actionName = name;

		if (previousAction) {
			previousAction.fadeOut(0.5);
		}
		newAction.reset().fadeIn(0.5).play();
		// 处理一次性动画
		if (name === 'Pointing Gesture' || name === 'Pointing') {
			newAction.setLoop(THREE.LoopOnce);
			newAction.clampWhenFinished = true;

			const onFinished = (event) => {
				if (event.action === newAction) {
					this.mixer.removeEventListener('finished', onFinished);
					this.action = 'Idle';
					if (this.local) {
						this.socketUpdate(); // 通知服务器
					}
				}
			};

			this.mixer.addEventListener('finished', onFinished);
		}
	}

	get action() {
		return this.actionName;
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

	socketUpdate(){
		// console.log("Player.socketUpdate");
		throw new Error("Player.socketUpdate must be overridden");
	}
}

class PlayerLocal extends Player {
	constructor(game, model, userId, username) {
		super(game, model, FBX_IMAGE.randomColour(), userId, username, true);
		this.initWebSocket();
	}

	initWebSocket(){
		//初始化GameWebSocket
		this.gameWebSocketService = new GameWebSocketService();
		this.gameWebSocketService.connect(this.userId);
		this.gameWebSocketService.onMessage(GAME_WS_MSG_TYPES.REMOTE_DATA, (message) => {
			this.game.remoteData = message.data;
		});
		this.gameWebSocketService.onMessage(GAME_WS_MSG_TYPES.REMOTE_PLAYER_DELETED, (message) => {
			const deletedUserId = message.userId;
			this.game.removePlayers(deletedUserId);
		});
		//初始化ChatWebSocket
		this.chatWebSocketService = new ChatWebSocketService(this.userId);
		console.log(this.chatWebSocketService);
		this.chatWebSocketService.connect();

		this.chatWebSocketService.socket.onmessage = (event) => {
			if (this.chatWebSocketService.socket.readyState === WebSocket.OPEN) {
				const data = JSON.parse(event.data);
				console.log(data);
				if(data.ifSelf==="false"){
					console.log("已经发送");
					eventBus.emit('newMessage', {
						localId: data.remoteId,
						remoteId: data.localId,
						socket: this.chatWebSocketService.socket
					});
				}

			}
		};

	}

	socketUpdate(){
		if (this.gameWebSocketService !== undefined){
			const data = {
				userId: this.userId,
				username: this.username,
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
}