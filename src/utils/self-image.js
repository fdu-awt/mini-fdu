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
};

export default SELF_IMAGE;