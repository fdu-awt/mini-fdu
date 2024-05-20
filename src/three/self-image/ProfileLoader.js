// 用于 ProfilePage 加载个人形象的模型

import * as THREE from 'three';
import {MMDLoader} from "three/examples/jsm/loaders/MMDLoader.js";
import {OrbitControls} from "three/addons";
import {clearModels} from "@/three/common";
import {resizeRendererToDisplaySize} from "@/three/common";
import {PMX_IMAGE} from "@/three/self-image/self-image";
import {FbxSelfImageLoader} from "@/three/SelfImageLoader";

class ProfileLoader{
	/**
	 * @description
	 * @param {HTMLCanvasElement} canvas 画布
	 * @param renderer_width
	 * @param renderer_height
	 * */
	constructor(canvas, renderer_width, renderer_height) {
		this.canvas = canvas;
		this.renderer_width = renderer_width;
		this.renderer_height = renderer_height;
		// 创建场景
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color('#eee');

		// 创建渲染器
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true // 抗锯齿
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(this.renderer_width, this.renderer_height);

		// 创建坐标轴辅助线
		// const axesHelper = new THREE.AxesHelper( 150 );
		// scene.add( axesHelper );

		this.camera =  new THREE.PerspectiveCamera(
			50, // FOV 视场角
			window.innerWidth / window.innerHeight, // 纵横比（aspect）
			0.1, // near 和 far 近剪裁面和远剪裁面定义了可视范围的深度
			1000
		);
		this.camera.position.set(0, 0, 35);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;

		// 全局光源设置
		// 创建半球光
		this.hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
		this.hemLight.position.set(0, 50, 0);
		this.scene.add(this.hemLight);

		// 创建定向光
		this.dirLight =
			new THREE.DirectionalLight(0xffffff, 2.4);
		// 设置光源位置
		this.dirLight.position.set(0, 20, 20);
		// 启用阴影
		this.dirLight.castShadow = true;
		this.dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
		this.scene.add(this.dirLight);
	}

	// eslint-disable-next-line no-unused-vars
	loadModel(name){
		return new Promise((resolve, reject) => {
			reject(new Error("Not implemented"));
		});
	}

	animate() {
		this.controls.update();
		requestAnimationFrame(this.animate.bind(this));
		this.renderer.render(this.scene, this.camera);

		if (resizeRendererToDisplaySize(this.renderer)) {
			const canvas = this.renderer.domElement;
			this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
			this.camera.updateProjectionMatrix();
		}
	}
}

// Genshin Impact for 原神
class GenshinImpactPmxProfileLoader extends ProfileLoader{
	static LOADER = new MMDLoader();
	constructor(canvas, renderer_width, renderer_height) {
		super(canvas, renderer_width, renderer_height);
	}

	loadModel(name){
		clearModels(this.scene);
		this.renderer.setSize(this.renderer_width, this.renderer_height);
		// 加载新模型
		const modelPath = PMX_IMAGE.getPathByName(name);
		const self = this;
		GenshinImpactPmxProfileLoader.LOADER.load(
			modelPath,
			function (mesh) {
				self.scene.add(mesh);
				// 调整模型位置
				const box = new THREE.Box3().setFromObject(mesh);
				const center = box.getCenter(new THREE.Vector3());
				mesh.position.sub(center); // 简化位置调整代码
				self.animate();
			},
			function (xhr) {
				console.log(`${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
			},
			function (error) {
				console.error('An error happened', error);
			}
		);
		this.scene.add(this.hemLight);
		this.scene.add(this.dirLight);
	}
}

class Lab1FbxProfileLoader extends ProfileLoader{
	static LOADER = new MMDLoader();
	constructor(canvas, renderer_width, renderer_height) {
		super(canvas, renderer_width, renderer_height);
		this.loader = new FbxSelfImageLoader();
	}

	loadModel(name) {
		this.loader.load(name).then((object) => {
			this.scene.add(object);
			this.animate();
		});
	}
}

export default ProfileLoader;
export {GenshinImpactPmxProfileLoader, Lab1FbxProfileLoader};