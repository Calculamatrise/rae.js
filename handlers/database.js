import DataStore from "../utils/Store.js"

export default class {
    createStore(model) {
        this[model.collection.name] = new DataStore(model);
    }
}