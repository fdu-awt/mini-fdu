import * as THREE from "three";
import {OrbitControls} from "three/addons";

/**
 * @description 调整渲染器大小以适应屏幕
 * @param renderer 渲染器
 * @returns {boolean} 是否需要调整大小
 * */
export function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement;
	const width = window.innerWidth;
	const height = window.innerHeight;
	const canvasPixelWidth = canvas.width / window.devicePixelRatio;
	const canvasPixelHeight = canvas.height / window.devicePixelRatio;

	const needResize =
		canvasPixelWidth !== width || canvasPixelHeight !== height;
	if (needResize) {
		renderer.setSize(width, height, false);
	}
	return needResize;
}

/**
 * @description 清理场景中旧的模型
 * */
export function clearModels(scene) {
	while (scene.children.length > 0) {
		const object = scene.children[0];
		if (object.isMesh) {
			object.geometry.dispose();
			// 检查material是否为数组
			if (Array.isArray(object.material)) {
				object.material.forEach(material => material.dispose());
			} else {
				object.material.dispose();
			}
		}
		scene.remove(object);
	}
}

/**
 * @description 初始化Three.js
 * @param {HTMLCanvasElement} canvas 画布
 * */
export function initializeThreeScene(canvas) {
	// 创建场景
	const scene = new THREE.Scene();
	scene.background = new THREE.Color('#eee');

	// 创建渲染器
	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true // 抗锯齿
	});
	renderer.shadowMap.enabled = true;

	// 创建相机
	const camera = new THREE.PerspectiveCamera(
		70, // FOV 视场角
		window.innerWidth / window.innerHeight, // 纵横比（aspect）
		0.1, // near 和 far 近剪裁面和远剪裁面定义了可视范围的深度
		1000
	);
	camera.position.set(0, 1.6, -35);//玩家角色后面一点
	camera.lookAt(0, 1.6, 0);//对着人身上某个点  视线大致沿着人的正前方

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;

	// 全局光源设置
	// 创建半球光
	const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
	hemLight.position.set(0, 50, 0);
	scene.add(hemLight);

	// 创建定向光
	const dirLight =
		new THREE.DirectionalLight(0xffffff, 2.4);
	// 设置光源位置
	dirLight.position.set(0, 20, 20);
	// 启用阴影
	dirLight.castShadow = true;
	dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
	scene.add(dirLight);
	return {scene, renderer, camera, controls, hemLight, dirLight};
}