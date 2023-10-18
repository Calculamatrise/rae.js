export default class {
	/**
	 * Creates a Proxy object.
	 * The Proxy object allows you to create an object that can be used in place of the original object,
	 * but which may redefine fundamental Object operations like getting, setting, and defining properties.
	 * Proxy objects are commonly used to log property accesses, validate, format, or sanitize inputs.
	 * @param {Object} target A target object to wrap with Proxy.
	 * @param {Object} handler An object whose properties define the behavior of Proxy when an operation is attempted on it.
	 * @param {Function} [handler.get] 
	 * @param {Function} [handler.set] 
	 */
	constructor(target, handler) {
		if ((target instanceof Object) == false || (handler instanceof Object) == false) {
			throw new TypeError("Cannot create proxy with a non-object as target or handler");
		}

		return target = new Proxy(target, {
			...handler,
			get(object, property) {
				let plain = JSON.parse(JSON.stringify(object));
				if (typeof plain[property] == 'object' && plain[property] !== null) {
					return new Proxy(object[property], this);
				}

				if (typeof handler.get == 'function') {
					return handler.get.apply(target, arguments);
				}

				return Reflect.get(...arguments);
			},
			set() {
				if (typeof handler.set == 'function') {
					return handler.set.apply(target, arguments);
				}

				return Reflect.set(...arguments);
			}
		});
	}
}