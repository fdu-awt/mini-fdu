import * as THREE from 'three';
import {GLTFLoader} from "three/addons";
import {OrbitControls} from "three/addons";
import {clearModels, resizeRendererToDisplaySize} from "@/three/common";
import SELF_IMAGE from "@/utils/self-image";
// 全局变量用于持久引用
let scene, renderer, camera, controls;
let hemLight, dirLight;

/**
 * @description 初始化Three.js
 * @param {HTMLCanvasElement} canvas 画布
 * @param renderer_width
 * @param renderer_height
 * */
export function initializeScene(canvas, renderer_width, renderer_height) {
	// 创建场景
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#eee');

	// 创建渲染器
	renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true // 抗锯齿
	});
	renderer.shadowMap.enabled = true;
	renderer.setSize(renderer_width, renderer_height);

	// 创建坐标轴辅助线
	// const axesHelper = new THREE.AxesHelper( 150 );
	// scene.add( axesHelper );

	camera =  new THREE.PerspectiveCamera(
		50, // FOV 视场角
		window.innerWidth / window.innerHeight, // 纵横比（aspect）
		0.1, // near 和 far 近剪裁面和远剪裁面定义了可视范围的深度
		1000
	);
	camera.position.set(0, 0, 35);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;

	// 全局光源设置
	// 创建半球光
	hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
	hemLight.position.set(0, 50, 0);
	scene.add(hemLight);

	// 创建定向光
	dirLight =
		new THREE.DirectionalLight(0xffffff, 2.4);
	// 设置光源位置
	dirLight.position.set(0, 20, 20);
	// 启用阴影
	dirLight.castShadow = true;
	dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
	scene.add(dirLight);
}

/**
 * @description 初始化Three.js
 * @param modelPath 模型路径
 * @param renderer_width
 * @param renderer_height
 * */
export function loadWithModel(modelPath, renderer_width, renderer_height) {
	clearModels(scene);
	renderer.setSize(renderer_width, renderer_height);
	// 加载新模型
	const imageName = "那维莱特";
	const glbConfig = 	SELF_IMAGE.getGlbConfigByName(imageName);
	modelPath = glbConfig.modelPath;
	const textureFiles = glbConfig.textureFiles;
	// 加载纹理
	const textures = textureFiles.map((file) => {
		const texture = new THREE.TextureLoader().load(file);
		texture.flipY = false; // 调整纹理方向
		return texture;
	});
	// 创建材质
	const materials = textures.map((texture) => {
		return new THREE.MeshBasicMaterial({map: texture});
	});
	const loader = new GLTFLoader();
	loader.load(
		modelPath,
		function (gltf) {
			console.log("gltf:");
			console.log(gltf);
			const model = gltf.scene.children[0];
			console.log("model:");
			console.log(model);
			let index = 0;
			model.traverse((o) => {
				// 加载纹理
				console.log(index);
				if (o.type === "Mesh") {
					console.log(o);
					console.log(o.name + "加载纹理");
					o.material = materials[index];
					index++;
				}
				// 设置是否产生阴影和接受阴影
				if (o.isMesh) {
					o.castShadow = true;
					o.receiveShadow = true;
				}
			});
			scene.add(model);
			// 调整模型位置
			const box = new THREE.Box3().setFromObject(model);
			const center = box.getCenter(new THREE.Vector3());
			model.position.sub(center); // 简化位置调整代码
			animate();
		},
		// called while loading is progressing
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		function (error) {
			console.error('An error happened', error);
		}
	);
	scene.add(hemLight);
	scene.add(dirLight);
	function animate() {
		controls.update();
		requestAnimationFrame(animate);
		renderer.render(scene, camera);

		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
	}
}