import EventEmitter from "events";
import mongoose from "mongoose";

import DataStore from "../utils/Store.js";

export default class extends EventEmitter {
    #connection = null;
    async connect(key) {
        this.#connection = await mongoose.connect(key, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            connectTimeoutMS: 10000
        }).catch(error => {
            this.emit("error", error);
        });

        if (this.#connection) {
            this.emit("connected", this.#connection);
            mongoose.connection.on("disconnected", (error) => {
                this.emit("disconnected", error);
            });

            return this.#connection;
        }

        return false;
    }

    createStore(model) {
        this[model.collection.name] = new DataStore(model);
    }
}