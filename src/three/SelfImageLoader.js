import {FBX_IMAGE} from "@/three/self-image/self-image";
import {FBXLoader} from "three/addons";
import * as THREE from "three";

class SelfImageLoader{
	constructor() {
	}

	// eslint-disable-next-line no-unused-vars
	load(name){
		// 直接调用基类时返回抛出异常的promise
		return new Promise((resolve, reject) => {
			reject(new Error("Not implemented"));
		});
	}


	getOriginalLoader(){
	}
}

class FbxSelfImageLoader extends SelfImageLoader{
	static FBX_LOADER = new FBXLoader();
	constructor() {
		super();
	}

	load(name){
		const modelPath = FBX_IMAGE.getModelPathByName(name);
		return new Promise((resolve, reject) => {
			FbxSelfImageLoader.FBX_LOADER.load(modelPath, (object) => {
				resolve(object);
			}, undefined, (error) => {
				reject(error);
			});
		});
	}

	getOriginalLoader(){
		return FbxSelfImageLoader.FBX_LOADER;
	}
}

class Lab1FbxSelfImageLoader extends FbxSelfImageLoader{
	constructor() {
		super();
	}

	load(modelName, colour){
		const modelPath = FBX_IMAGE.getModelPathByName(modelName);
		colour = colour || FBX_IMAGE.randomColour();
		return new Promise((resolve, reject) => {
			FbxSelfImageLoader.FBX_LOADER.load(modelPath, (object) => {
				object.mixer = new THREE.AnimationMixer(object);
				object.name = "Person";
				object.traverse(function (child) {
					if (child.isMesh) {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
				const textureLoader = new THREE.TextureLoader();
				textureLoader.load(FBX_IMAGE.getTexturePath(modelName, colour), function (texture) {
					object.traverse(function (child) {
						if (child.isMesh) {
							child.material.map = texture;
						}
					});
				});
				resolve(object);
			}, undefined, (error) => {
				reject(error);
			});
		});
	}
}

export default SelfImageLoader;
export {FbxSelfImageLoader, Lab1FbxSelfImageLoader};