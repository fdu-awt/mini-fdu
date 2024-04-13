export function deepCopy(obj, hash = new WeakMap()) {
	// 处理日期对象
	if (obj instanceof Date) {
		return new Date(obj);
	}
	// 处理正则对象
	if (obj instanceof RegExp) {
		return new RegExp(obj);
	}
	// 处理函数（可选，如果需要复制函数，可以按需修改）
	if (typeof obj === 'function') {
		return obj.bind(null);
	}
	// 防止循环引用
	if (hash.has(obj)) {
		return hash.get(obj);
	}
	// 处理数组或对象
	if (typeof obj === 'object' && obj !== null) {
		const cloneObj = Array.isArray(obj) ? [] : {};
		hash.set(obj, cloneObj);

		for (const key in obj) {
			// eslint-disable-next-line no-prototype-builtins
			if (obj.hasOwnProperty(key)) { // 确保不复制原型链上的属性
				cloneObj[key] = deepCopy(obj[key], hash);
			}
		}
		return cloneObj;
	}
	// 处理原始类型和不需要深度复制的类型
	return obj;
}
