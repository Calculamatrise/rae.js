import mongoose from "mongoose";
import DataStore from "../utils/Store.js";

export default class {
    #connection = null;
    #events = new Map();
    on(event, handler) {
        if (typeof event !== "string") throw new TypeError("Event must be of type String.");
        if (typeof handler !== "function") throw new TypeError("Handler must be of type Function.");
        this.#events.set(event, handler);
        return handler;
    }

    #emit(event, ...args) {
        let handler = this.#events.get(event);
        if (handler) {
            return handler.call(this, ...args);
        }

        return false;
    }

    async connect(key) {
        this.#connection = await mongoose.connect(key, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            connectTimeoutMS: 10000
        }).catch(error => {
            this.#emit("error", error);
        });

        if (this.#connection) {
            this.#emit("connected", this.#connection);
            mongoose.connection.on("disconnected", (error) => {
                this.#emit("disconnected", error);
            });

            return this.#connection;
        }

        return false;
    }

    createStore(model) {
        this[model.collection.name] = new DataStore(model);
    }
}