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

		this.position = position;
		this.rotation = rotation;
		this.nameTextPosition = nameTextPosition;
		this.colliderPosition = colliderPosition;
	}


	init() {
		NPC.LOADER.load(this.model).then((object) => {
			this.mixer = object.mixer;
			this.object = object;
			this.object.position.copy(this.position);
			this.object.rotation.copy(this.rotation);
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
			// TODO 加入game的碰撞检测

			// TODO idle动画
		});
	}

	// TODO NPC 的交互

	update(dt) {
		if (this.mixer) {
			this.mixer.update(dt);
		}
	}
}

export default NPC;