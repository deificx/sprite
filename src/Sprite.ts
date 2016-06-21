import {
	Configuration,
	RGBA,
} from './interfaces.ts'; 

import {
	tileSize,
} from './enums.ts';

function rgba(color: RGBA) {
	return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}

function clamp(n, min, max) {
	return n < min ? min : n > max ? max : n;
}

export default class Sprite {
	canvas: HTMLCanvasElement,
	config: Configuration;
	sprite: Array<Array<RGBA>>;

	constructor(canvas: HTMLCanvasElement, config: Configuration) {
		this.canvas = canvas;
		this.config = config;
		this.sprite = [];

		for (var i = 0; i < tileSize.Large; i++) {
			var columns = [];
			for (var j = 0; j < tileSize.Large; j++) {
				columns.push({
					r: 128,
					g: 128,
					b: 128,
					a: 0,
				});
			}
			this.sprite.push(columns);
		}
	}

	_draw(x: number, y: number) {
		if (typeof this.sprite[x] !== 'undefined' && typeof this.sprite[x][y] !== 'undefined') {
			let rVary = 0;
			let gVary = 0;
			let bVary = 0;
			if (this.config.colorVary) {
				rVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
				gVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
				bVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
			}
			this.sprite[x][y] = {
				r: this.config.color.r + rVary,
				g: this.config.color.g + gVary,
				b: this.config.color.b + bVary,
				a: this.config.color.a,
			};
		}
	}

	_neighbours(x: number, y: number) {
		const neighbours = [];
		neighbours.push({ x: x - 1, y: y });
		neighbours.push({ x: x + 1, y: y });
		neighbours.push({ x: x, y: y - 1 });
		neighbours.push({ x: x, y: y + 1 });
		return neighbours;
	}

	draw(x: number, y: number) {
		let neighbours = [{ x, y }];
		for (let i = 1; i <= this.config.brushSize; i++) {
			if (i < this.config.brushSize) {
				neighbours.forEach((neighbour) => {
					neighbours = neighbours.concat(this._neighbours(neighbour.x, neighbour.y));
				});
			}
		}
		neighbours.forEach((neighbour) => {
			this._draw(neighbour.x, neighbour.y);
		});
	}

	grid() {
		this.config.ctx.strokeStyle = rgba({ r: 128, g: 128, b: 128, a: 0.25 });
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
				this.config.ctxP.beginPath();
				this.config.ctxP.fillStyle = rgba(this.sprite[i][j]);
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
				this.config.ctx.beginPath();
				this.config.ctx.fillStyle = rgba(this.sprite[i][j]);
				this.config.ctx.fillRect(i * this.config.scale, j * this.config.scale, this.config.scale, this.config.scale);
				this.config.ctx.closePath();
			}
		}
	}
}
