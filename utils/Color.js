export default class Color {
    red = 255;
    green = 255;
    blue = 255;
    alpha = 255;

    /**
     * 
     * @param {any} [value]
     */
    constructor(value) {
        if (typeof value == 'object') {
            if (value instanceof Array) {
                this.red = ~~value[0] ?? 255;
                this.green = ~~value[1] ?? 255;
                this.blue = ~~value[2] ?? 255;
                this.alpha = ~~(value[3] ?? 255);
            } else {
                this.red = ~~(value.r ?? value.red) ?? 255;
                this.green = ~~(value.g ?? value.green) ?? 255;
                this.blue = ~~(value.b ?? value.blue) ?? 255;
                this.alpha = ~~(value.a ?? value.alpha ?? 255);
            }
        } else if (typeof value == 'number') {
            if (arguments.length >= 3) {
                this.red = ~~arguments[0] ?? 255;
                this.green = ~~arguments[1] ?? 255;
                this.blue = ~~arguments[2] ?? 255;
                this.alpha = ~~(arguments[3] ?? 255);
            } else {
                if ((value & 0xFF000000) !== 0) {
                    this.alpha = (value & 0xFF000000) >> 24;
                }

                this.red = (value & 0xFF0000) >> 16;
                this.green = (value & 0xFF00) >> 8;
                this.blue = value & 0xFF;
            }
        } else if (typeof value == 'string') {
            let arr = value.match(new RegExp(`[^#]{${1 + (value.length > 5)}}`, 'g'));
            if (arr !== null) {
                let values = arr.map(hex => parseInt(hex.padStart(2, hex), 16));
                this.red = ~~values[0] ?? 255;
                this.green = ~~values[1] ?? 255;
                this.blue = ~~values[2] ?? 255;
                this.alpha = ~~(values[3] ?? 255);
            }
        }
    }

    static from() {
        return new Color(...arguments);
    }

    /**
     * Convert color to decimal value
     * @param {Boolean} [alpha] include alpha in decimal
     * @returns {Number}
     */
    toDecimal(alpha = false) {
        return ((alpha ? this.alpha : 0) << 24) + (this.red << 16) + (this.green << 8) + this.blue;
    }

    /**
     * Convert color to hexadecimal value
     * @returns {String}
     */
    toHex(alpha = true) {
        return '#' + [ this.red, this.green, this.blue, this.alpha ].map(decimal => decimal.toString(16).padStart(2, '0')).join('').slice(0, alpha ? -2 : Infinity);
    }

    /**
     * Convert color to string
     * @param {Number} [radix]
     * @returns {String}
     */
    toString(radix) {
        return 'rgba(' + [ this.red, this.green, this.blue, this.alpha / 255 ].join(', ') + ')'.toString(radix ?? 10);
    }
}