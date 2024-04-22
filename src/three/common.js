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