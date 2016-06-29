import {
	RGBA,
} from './interfaces.ts';

function clamp(n: number, min: number, max: number): number {
	return Math.round(n < min ? min : n > max ? max : n);
}

export default class Pixel {
	color: RGBA;
	empty: boolean;

	constructor() {
		this.color = {
			r: 0,
			g: 0,
			b: 0,
			a: 0,
		};
		this.empty = true;
	}

	_combine(color: RGBA) {
		this.color = {
			r: clamp(this.color.r + ((this.color.r - color.r) * color.a * -1), 0, 255),
			g: clamp(this.color.g + ((this.color.g - color.g) * color.a * -1), 0, 255),
			b: clamp(this.color.b + ((this.color.b - color.b) * color.a * -1), 0, 255),
			a: parseInt(clamp(Math.round((this.color.a / color.a) * 100) / 100, 0, 100).toFixed(0), 10),
		};
	}

	_vary(color: RGBA) {
		this.color = {
			r: clamp(color.r + Math.round(Math.random() * 64 - 32), 0, 255),
			g: clamp(color.g + Math.round(Math.random() * 64 - 32), 0, 255),
			b: clamp(color.b + Math.round(Math.random() * 64 - 32), 0, 255),
			a: color.a,
		};
	}

	r(): number {
		return this.color.r;
	}

	g(): number {
		return this.color.g;
	}

	b(): number {
		return this.color.b;
	}

	a(): number {
		return this.color.a;
	}

	rgba(): string {
		return 'rgba(' + this.color.r + ', ' + this.color.g + ', ' + this.color.b + ',' + this.color.a + ')';
	}

	setColor(color: RGBA, vary: boolean) {

		if (color.a < 1 && !this.empty) {
			this._combine(color);
		} else if (vary) {
			this._vary(color);
		} else {
			this.color = {
				r: color.r,
				g: color.g,
				b: color.b,
				a: color.a,
			};
		}

		if (this.empty) {
			this.empty = false;
		}
	}
}
