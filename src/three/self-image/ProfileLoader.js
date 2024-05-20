// 用于 ProfilePage 加载个人形象的模型

import * as THREE from 'three';
import {OrbitControls} from "three/addons";
import {resizeRendererToDisplaySize, clearModels} from "@/three/common";
import {Lab1FbxSelfImageLoader} from "@/three/SelfImageLoader";

// 全局变量用于持久引用
let scene, renderer, camera, controls;
let sun;
const loader = new Lab1FbxSelfImageLoader();
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

	camera =  new THREE.PerspectiveCamera(
		50, // FOV 视场角
		window.innerWidth / window.innerHeight, // 纵横比（aspect）
		0.1, // near 和 far 近剪裁面和远剪裁面定义了可视范围的深度
		1000
	);
	camera.position.set(0, 0, 700);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;

	const light = new THREE.DirectionalLight(0xaaaaaa);
	light.position.set(0, 0, 700);
	light.target.position.set(0, 0, 1000);
	light.castShadow = true;
	const lightSize = 500;
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 500;
	light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
	light.shadow.camera.right = light.shadow.camera.top = lightSize;
	light.shadow.bias = 0.0039;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	sun = light;
	scene.add(sun);
}

/**
 * @description 初始化Three.js
 * @param modelName 模型名称
 * @param renderer_width
 * @param renderer_height
 * */
export function loadWithModel(modelName, renderer_width, renderer_height) {
	clearModels(scene);
	renderer.setSize(renderer_width, renderer_height);

	// 加载新模型
	loader.load(modelName).then((object) => {
		scene.add(object);
		// 调整模型位置
		const box = new THREE.Box3().setFromObject(object);
		const center = box.getCenter(new THREE.Vector3());
		object.position.sub(center);
		sun.target = object;
		animate();
	});
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
