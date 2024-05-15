const SELF_IMAGE = {
	defaultModelName: "FireFighter",
	validName(name) {
		return FBX_IMAGE.PEOPLE.includes(name);
	},
	/**
	 * @description 获取可供选择的模型名称
	 * */
	getModelChoices() {
		return FBX_IMAGE.PEOPLE;
	}
};

const PMX_IMAGE = {
	modelMap: {
		"万叶": "/万叶/万叶.pmx",
		"云堇": "/云堇/云堇.pmx",
		"五郎": "/五郎/五郎.pmx",
		"千织": "/千织/千织.pmx",
		"多莉": "/多莉/多莉.pmx",
		"烟绯": "/烟绯/烟绯.pmx",
		"芭芭拉": "/芭芭拉/芭芭拉.pmx",
		"荒泷一斗": "/荒泷一斗/荒泷一斗.pmx",
		"test": "test/荒泷一斗.pmx",
		"行秋": "/行秋/行秋.pmx",
		"那维莱特": "/那维莱特/那维莱特.pmx",
		"花时来信_神里绫华": "/花时来信_神里绫华/神里绫华.pmx",
	},
	/**
	 * 通过 name 获取 path
	 * @param {String} name 模型名称
	 * @return {String} 模型路径
	 * */
	getPathByName(name) {
		name = name || SELF_IMAGE.defaultModelName;
		return this.modelMap[name];
	},
};

const GLTF_IMAGE = {
	modelMap: {
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
		"荒泷一斗": {
			modelPath: "/荒泷一斗/荒泷一斗.glb",
			textureFiles: [
				"/荒泷一斗/tex/spa_h.png",
				"/荒泷一斗/tex/髪.png",
				"/荒泷一斗/tex/颜.png",
				"/荒泷一斗/tex/体.png",
				"/荒泷一斗/tex/肌.png",
			],
			// 动画名称
			animations: {
				idle: 'Idle',
				running: "Running",
				walking: 'Walking',
				waving: 'Waving',
			},
			shouldAddTexture: (type) => {
				return type === "SkinnedMesh";
			},
		},
	},
	getGlbConfigByName(name) {
		return this.modelMap[name];
	}
};

const FBX_IMAGE = {
	SCENE_PATH: "/fbx_models/fbx/town.fbx",
	CUBE_TEXTURE_PATH: "/fbx_models/images/",
	ANIMATION_PATH_PREFIX: "/fbx_models/fbx/anims/",
	MODEL_PATH_PREFIX: "/fbx_models/fbx/people",
	TEXTURE_PATH_PREFIX: "/fbx_models/images/SimplePeople_",
	PEOPLE: ['BeachBabe', 'BusinessMan', 'Doctor', 'FireFighter', 'Housewife', 'Policeman', 'Prostitute', 'Punk', 'RiotCop', 'Roadworker', 'Robber', 'Sheriff', 'Streetman', 'Waitress'],
	COLOURS: ['Black', 'Brown', 'White'],
	randomColour() {
		return this.COLOURS[Math.floor(Math.random() * this.COLOURS.length)];
	},
	getModelPathByName(name) {
		return `${this.MODEL_PATH_PREFIX}/${name}.fbx`;
	},
	getTexturePath(model, colour) {
		return `${this.TEXTURE_PATH_PREFIX}${model}_${colour}.png`;
	},
	getAnimPath(anim) {
		return `${this.ANIMATION_PATH_PREFIX}${anim}.fbx`;
	},
};

export {PMX_IMAGE, GLTF_IMAGE, FBX_IMAGE};
export default SELF_IMAGE;
