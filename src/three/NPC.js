import {Lab1FbxSelfImageLoader} from "@/three/SelfImageLoader";
import * as THREE from "three";
import {createNPCNameText} from "@/three/common";

class NPC {
	static LOADER = new Lab1FbxSelfImageLoader();

	constructor(game, model, colour, name, 
		position, rotation, nameTextPosition,
		colliderPosition={width: 100, height: 300, depth: 100}) {
		this.game = game;
		this.model = model;
		this.colour = colour;
		this.name = name || "NPC";
		this.animations = this.game.animations;

		this.position = position;
		this.rotation = rotation;
		this.nameTextPosition = nameTextPosition;
		this.colliderPosition = colliderPosition;
	}


	init() {
		NPC.LOADER.load(this.model).then((object) => {
			this.mixer = object.mixer;
			this.object = object;
			// this.object.name = "NPC_" + this.name;
			this.object.position.set(this.position.x, this.position.y, this.position.z);
			this.object.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
			// 在头顶显示 npc 名字
			const nameText = createNPCNameText(this.name);
			nameText.position.copy(this.nameTextPosition);
			this.object.add(nameText);

			this.game.scene.add(this.object);

			// 作为障碍物
			const geometry = new THREE.BoxGeometry(
				this.colliderPosition.width, this.colliderPosition.height, this.colliderPosition.depth);
			const material = new THREE.MeshBasicMaterial({visible:false});
			const box = new THREE.Mesh(geometry, material);
			box.name = "Collider";
			box.position.set(0, 150, 0);
			this.object.add(box);

			// 保存对 collider 的引用
			this.collider = box;

			// TODO 加入game的碰撞检测

			// idle动画
			this.action = "Idle";
		});
	}

	// NPC 的交互
	interact() {
		console.log("Interacting with NPC:", this.name);
		let event = new Event("ShowQuizDialog");
		event.npcName = this.name;
		window.dispatchEvent(event);
	}

	set action(name) {
		if (this.actionName === name) return;

		const clip = this.animations[name];
		const action = this.mixer.clipAction(clip);
		action.time = 0;
		this.mixer.stopAllAction();
		this.actionName = name;
		action.fadeIn(0.5);
		action.play();
	}


	update(dt) {
		if (this.mixer) {
			this.mixer.update(dt);
		}
	}
}

export default NPC;