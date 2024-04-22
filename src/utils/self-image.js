const SELF_IMAGE = {
	modelMap: {
		"万叶": "/万叶/万叶.pmx",
		"云堇": "/云堇/云堇.pmx",
		"五郎": "/五郎/五郎.pmx",
		"千织": "/千织/千织.pmx",
		"多莉": "/多莉/多莉.pmx",
		"烟绯": "/烟绯/烟绯.pmx",
		"芭芭拉": "/芭芭拉/芭芭拉.pmx",
		"荒泷一斗": "/荒泷一斗/荒泷一斗.pmx",
		"行秋": "/行秋/行秋.pmx",
		"那维莱特": "/那维莱特/那维莱特.pmx",
		"花时来信_神里绫华": "/花时来信_神里绫华/神里绫华.pmx",
	},
	glbConfigMap: {
		"那维莱特": {
			modelPath: "/那维莱特/那维莱特.glb",
			textureFiles: [
				"/那维莱特/tex/颜.png",
				"/那维莱特/tex/spa_h.png",
				"/那维莱特/tex/体.png",
				"/那维莱特/tex/髮.png",
			],
			shouldAddTexture: (type) => {
				return type === "Mesh";
			},
		},
		"多莉": {
			modelPath: "/多莉/多莉.glb",
			textureFiles: [
				"/多莉/tex/颜.png",
				"/多莉/tex/spa_h.png",
				"/多莉/tex/体.png",
				"/多莉/tex/髮.png",
				"/多莉/tex/肌.png",
				"/多莉/hair.bmp",
			],
			shouldAddTexture: (type) => {
				return type === "SkinnedMesh";
			},
		},
	},
	// 默认模型
	defaultModel: {
		name: "万叶",
		path: "/万叶/万叶.pmx",
	},
	/**
	 * 通过 name 获取 path
	 * @param {String} name 模型名称
	 * @return {String} 模型路径, 默认返回 defaultModelPath
	 * */
	getPathByName(name) {
		if (!name) {
			return this.defaultModel.path;
		}
		return this.modelMap[name] || this.defaultModel.path;
	},
	validName(name) {
		return !!this.modelMap[name];
	},
	getGlbConfigByName(name) {
		return this.glbConfigMap[name];
	}
};

export default SELF_IMAGE;