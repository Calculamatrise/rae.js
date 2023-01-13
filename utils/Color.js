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
                return new this.constructor(...value);
            } else {
                return new this.constructor(value.r ?? value.red, value.g ?? value.green, value.b ?? value.blue, value.a ?? value.alpha);
            }
        } else if (typeof value == 'number') {
            if (arguments.length >= 3) {
                this.red = Math.min(~~arguments[0], 255);
                this.green = Math.min(~~arguments[1], 255);
                this.blue = Math.min(~~arguments[2], 255);
                this.alpha = Math.min(~~arguments[3], 255);
            } else {
                if ((value & 0xFF000000) !== 0) {
                    this.alpha = Math.min((value & 0xFF000000) >> 24, 255);
                }

                this.red = Math.min((value & 0xFF0000) >> 16, 255);
                this.green = Math.min((value & 0xFF00) >> 8, 255);
                this.blue = Math.min(value & 0xFF, 255);
            }
        } else if (typeof value == 'string') {
            if (/^rgb/i.test(value)) {
                value = value.replace(/^rgba?\((.*)\)$/i, '$1');
                return new this.constructor(...value.split(/\s*,\s*/));
            }

            value = value.match(new RegExp(`[^#]{${1 + (value.length > 5)}}`, 'g'));
            return new this.constructor(...value.map(hex => parseInt(hex.padStart(2, hex), 16)));
        }
    }

    static from() {
        return new this(...arguments);
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
        return '#' + [this.red, this.green, this.blue, this.alpha].map(decimal => decimal.toString(16).padStart(2, '0')).join('').slice(0, alpha ? -2 : Infinity);
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