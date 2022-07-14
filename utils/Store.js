export default class {
    constructor(model) {
        this.store = model;
    }
    store = null;
    async get(id) {
        if (id === void 0) return this.store.find({});
        return await this.store.findOne({ id }) || null;
    }

    update = this.set;
    async set(id, settings) {
        let item = await this.get(id) ?? await this.store.create({ id });
        await item.updateOne(merge(item, settings));
        return item;
    }

    delete(id) {
        return this.store.findOneAndDelete({ id });
    }
}

function merge(parent, object) {
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            if (typeof parent[key] === "object" && typeof object[key] === "object") {
                parent[key] = merge(parent[key], object[key]);
                continue;
            }

            parent[key] = object[key];
        }
    }

    return parent;
}