import {
	Configuration,
	RGBA,
} from './interfaces.ts'; 

import {
	tileSize,
} from './enums.ts';

import Pixel from './Pixel.ts';

export default class Sprite {
	canvas: HTMLCanvasElement;
	config: Configuration;
	drawing: boolean;
	sprite: Array<Array<Pixel>>;
	touching: string;

	constructor(canvas: HTMLCanvasElement, config: Configuration) {
		this.canvas = canvas;
		this.config = config;
		this.drawing = false;
		this.sprite = [];
		this.touching = '';

		for (var i = 0; i < tileSize.Large; i++) {
			var columns = [];
			for (var j = 0; j < tileSize.Large; j++) {
				columns.push(new Pixel());
			}
			this.sprite.push(columns);
		}
	}

	_draw(x: number, y: number) {
		if (typeof this.sprite[x] !== 'undefined' &&
			typeof this.sprite[x][y] !== 'undefined' &&
			this.touching !== 'x'+x+'y'+y) {
			this.touching = 'x'+x+'y'+y;
			this.sprite[x][y].setColor(this.config.color, this.config.colorVary);
		}
	}

	draw(x: number, y: number) {
		this._draw(x, y);
	}

	eyeDropper(x: number, y: number): RGBA {
		if (typeof this.sprite[x] !== 'undefined' &&
			typeof this.sprite[x][y] !== 'undefined' &&
			!this.sprite[x][y].empty) {
			return {
				r: this.sprite[x][y].r(),
				g: this.sprite[x][y].g(),
				b: this.sprite[x][y].b(),
				a: this.sprite[x][y].a(),
			};
		}
		return {
			r: this.config.color.r,
			g: this.config.color.g,
			b: this.config.color.b,
			a: this.config.color.a,
		};
	}

	grid() {
		this.config.ctx.strokeStyle = 'rgba(128, 128, 128, 0.25)';
		this.config.ctx.lineWidth = 1;
		for (var i = 0; i <= this.config.size; i++) {
			this.config.ctx.beginPath();
			this.config.ctx.moveTo(i * this.config.scale, 0);
			this.config.ctx.lineTo(i * this.config.scale, this.canvas.height);
			this.config.ctx.closePath();
			this.config.ctx.stroke();
			this.config.ctx.beginPath();
			this.config.ctx.moveTo(0, i * this.config.scale);
			this.config.ctx.lineTo(this.canvas.height, i * this.config.scale);
			this.config.ctx.closePath();
			this.config.ctx.stroke();
		}
	}

	preview(once: boolean) {
		for (let i = 0; i < this.config.size; i++) {
			for (let j = 0; j < this.config.size; j++) {
				if (this.sprite[i][j].empty) {
					continue;
				}
				this.config.ctxP.beginPath();
				this.config.ctxP.fillStyle = this.sprite[i][j].rgba();
				this.config.ctxP.fillRect(i, j, 1, 1);
				this.config.ctxP.closePath();
			}
		}
		if (!once) {
			const tile = this.config.ctxP.getImageData(0, 0, this.config.size, this.config.size);
			this.config.ctxP.putImageData(tile, this.config.size, 0);
			this.config.ctxP.putImageData(tile, this.config.size * 2, 0);
			this.config.ctxP.putImageData(tile, this.config.size * 2, this.config.size);
			this.config.ctxP.putImageData(tile, this.config.size * 2, this.config.size * 2);
			this.config.ctxP.putImageData(tile, 0, this.config.size);
			this.config.ctxP.putImageData(tile, 0, this.config.size * 2);
			this.config.ctxP.putImageData(tile, this.config.size, this.config.size);
			this.config.ctxP.putImageData(tile, this.config.size, this.config.size * 2);
		}
	}

	render() {
		for (var i = 0; i < this.config.size; i++) {
			for (var j = 0; j < this.config.size; j++) {
				if (this.sprite[i][j].empty) {
					continue;
				}
				this.config.ctx.beginPath();
				this.config.ctx.fillStyle = this.sprite[i][j].rgba();
				this.config.ctx.fillRect(i * this.config.scale, j * this.config.scale, this.config.scale, this.config.scale);
				this.config.ctx.closePath();
			}
		}
	}

	startDrawing() {
		this.drawing = true;
		this.touching = '';
	}

	stopDrawing() {
		this.drawing = false;
	}
}
