import {FBXLoader} from "three/addons";
import {FBX_IMAGE} from "@/three/self-image/self-image";
import * as THREE from "three";

class GameEnvironment {
	constructor() {
	}

	// eslint-disable-next-line no-unused-vars
	load(game, loader) {
	}
}

class Town extends GameEnvironment {
	constructor() {
		super();
	}

	load(game, loader) {
		loader = loader || new FBXLoader();
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

export default GameEnvironment;
export {Town};