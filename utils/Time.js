export default class {
    constructor(t, e) {
        this.ms = parseInt(t);
        this.time = parseInt(t);
        this.type = e || "miliseconds";
        this.parse();
    }

    parse() {
        if (this.time > 1) this.type += "s";
        this.ms = this.time * function(t) {
            if (t.match(/^(ms|mili|milisecs|milisecond|miliseconds)/gi)) {
                return 1;
            } else if (t.match(/^(s|secs|second|seconds)/gi)) {
                return 1e3;
            } else if (t.match(/^(m|min|mins|minute|minutes)/gi)) {
                return 6e4;
            } else if (t.match(/^(h|hrs|hour|hours)/gi)) {
                return 3.6e6;
            } else if (t.match(/^(d|day|days)/gi)) {
                return 8.64e7;
            } else if (t.match(/^(w|week|weeks)/gi)) {
                return 6048e5;
            } else {
                return 1;
            }
        }(this.type);
    }

    toString() {
        return this.ms + " miliseconds";
    }
}
