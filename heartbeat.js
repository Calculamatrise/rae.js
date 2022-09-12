import EventEmitter from "events";
import { Server, Socket } from "net";

export default class extends EventEmitter {
    #beats = 0;
    get beats() {
        return this.#beats;
    }

    #entity = new Socket();
    #heart = new Server(function(socket) {
        socket.on("data", function(data) {
            const message = data.toString();
            if (message.startsWith("PULSE")) {
                socket.write("RETURN");
                return;
            }
        });
    });

    #rate = 0;
    get rate() {
        return this.#rate;
    }

    /**
     * Create a constant heartbeat
     * @param {object} [options]
     * @param {number} [options.rate]
     * @param {number} [options.port]
     */
    constructor(options = {}) {
        super();

        this.setHeartRate(options.rate);
        this.#entity.on("data", data => {
            const message = data.toString();
            if (message.startsWith("RETURN")) {
                this.emit("pulse", ++this.#beats);
                return void setTimeout(this.pulse.bind(this), this.#rate);
            }
        });

        if (typeof options == 'object') {
            if ('port' in options) {
                this.listen(options);
            }
        }
    }

    pulse() {
        this.#entity.write("PULSE");
    }

    /**
     * Modify heart rate
     * @param {number} rate 
     */
    setHeartRate(rate) {
        this.#rate = ~~rate || 1e3
    }

    /**
     * Listen on a port
     * @param {object} [options]
     * @param {number} [options.port]
     * @param {function} [options.listeningListener]
     */
    listen(options = {}, listeningListener) {
        const port = options.port ?? 6663;
        if (typeof listeningListener == 'function') {
            this.#heart.on("listening", listeningListener);
        }

        this.#heart.listen(port, () => this.#entity.connect(port, this.pulse.bind(this)));
    }
}