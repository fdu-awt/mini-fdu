import {FBXLoader} from "three/addons";
import {FBX_IMAGE} from "@/three/self-image/self-image";
import * as THREE from "three";
import {getAllHistoryData} from "@/api/study.js";
import {getAllClubData} from "@/api/study.js";

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

class GuangHuaLou extends GameEnvironment{
	constructor() {
		super();
		

		getAllClubData().then((res)=>{
			if(res.code==200){
				this.club_data = res.object;
			}
		}).catch(e => {
			console.error(e);
		});
	}

	load(game, loader) {
		function loadImage(child) {
			let name = child.name;
			if(name.startsWith("post")){
				getAllHistoryData().then((res)=>{
					if(res.code==200){
						const history_data = res.object;

						let post_id = Number(name.substring(4));
						const image_path = "./history/images/"+history_data[post_id].image;
						
						const textureLoader = new THREE.TextureLoader();
						const postImageLoader = textureLoader.load(image_path);
			
						const material = new THREE.MeshBasicMaterial({
							map: postImageLoader,
							side: THREE.DoubleSide
						});
			
						child.material = material;
					}
				}).catch(e => {
					console.error(e);
				});
			}

			if(name.startsWith("clubpost")){
				getAllClubData().then((res)=>{
					if(res.code==200){
						const club_data = res.object;
						
						// const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);	  
						// child.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

						let club_id = Number(name.substring(8));
						const image_path = "./club/images/"+club_data[club_id].profile;
						
						const textureLoader = new THREE.TextureLoader();
						const postImageLoader = textureLoader.load(image_path);

						// postImageLoader.wrapS = THREE.RepeatWrapping;
						// postImageLoader.wrapT = THREE.RepeatWrapping;
						// postImageLoader.repeat.set(1,1);

			
						const material = new THREE.MeshBasicMaterial({
							map: postImageLoader,
							side: THREE.DoubleSide
						});
			
						child.material = material;
					}
				}).catch(e => {
					console.error(e);
				});
			}
		}

		loader = loader || new FBXLoader();
		loader.load(FBX_IMAGE.GUANGHUALOU_PATH, function(object) {
			game.scene.add(object);
			object.traverse(function (child) {
				if(child.isMesh) {
					if (child.name.startsWith("平面") || child.geometry instanceof THREE.BufferGeometry && child.geometry.name.startsWith("平面")) {
						// 设置平面两面可见
						child.material.side = THREE.DoubleSide;
					}

					if (child.name.startsWith("post")){
						console.log("post", child.name);
						// 处理光华路海报
						game.post.push(child);
						loadImage(child);
					}

					if (child.name.startsWith("clubpost")){
						// 处理社团活动海报
						game.clubs.push(child);
						loadImage(child);
					}
				}
			});
		});
	}
}

export default GameEnvironment;
export {Town};
export {GuangHuaLou};