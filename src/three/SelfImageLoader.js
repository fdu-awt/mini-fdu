import {FBX_IMAGE} from "@/three/self-image/self-image";
import {FBXLoader} from "three/addons";

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

export default SelfImageLoader;
export {FbxSelfImageLoader};