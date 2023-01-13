import RecursiveProxy from "./RecursiveProxy.js";

export default class {
    store = null;
    constructor(model) {
        this.store = model;
    }

    async get(id) {
        if (id === void 0) return this.store.find({});
        return this.store.findOne({ id }).then(item => {
            if (item === null) return null;
            return new RecursiveProxy(item, {
                async set(target, property, value) {
                    if (target[property] !== value) {
                        target[property] = value;
                        await item.save();
                    }

                    return true;
                }
            });
        });
    }

    update = this.set;
    async set(id, settings = {}) {
        let item = await this.get(id) ?? await this.store.create({ id });
        await item.updateOne(merge(JSON.parse(JSON.stringify(item)), settings));
        return item;
    }

    delete(id) {
        return this.store.findOneAndDelete({ id });
    }
}

function merge(parent, object) {
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            if (typeof parent[key] == 'object' && typeof object[key] == 'object') {
                parent[key] = merge(parent[key], object[key]);
                continue;
            }

            parent[key] = object[key];
        }
    }

    return parent;
}