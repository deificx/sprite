/// <reference path="../typings/index.d.ts" />

declare var require: {
	<T>(path: string): T;
	(paths: string[], callback: (...modules: any[]) => void): void;
	ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

require('./index.css');
import html from './html.ts';
import templates from './templates.ts';
import Ractive = require('ractive');
Ractive.DEBUG = false;

import {
	Configuration,
	MousePos,
	RGBA,
} from './interfaces.ts';

import {
	scaleSize,
	tileSize,
} from './enums.ts';

var ctx: CanvasRenderingContext2D = html.canvas.getContext('2d');
var ctxP: CanvasRenderingContext2D = html.preview.getContext('2d');

var configuration: Configuration = {
	brushSize: 1,
	color: {
		r: 0,
		g: 0,
		b: 0,
		a: 1,
	},
	scale: scaleSize.Medium,
	showGrid: false,
	size: tileSize.Medium,
};

var mouse: MousePos = {
	x: 0,
	y: 0,
};

function rgba(color: RGBA) {
	return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}

function clamp(n, min, max) {
	return n < min ? min : n > max ? max : n;
}

class Sprite {
	colorVary: boolean;
	sprite: Array<Array<RGBA>>;

	constructor(colorVary: boolean) {
		this.colorVary = colorVary;
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
			if (this.colorVary) {
				rVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
				gVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
				bVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
			}
			this.sprite[x][y] = {
				r: configuration.color.r + rVary,
				g: configuration.color.g + gVary,
				b: configuration.color.b + bVary,
				a: configuration.color.a,
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
		let neighbours = [{x,y}];
		for (let i = 1; i <= configuration.brushSize; i++) {
			if (i < configuration.brushSize) {
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
		ctx.strokeStyle = rgba({ r: 128, g: 128, b: 128, a: 0.25 });
		ctx.lineWidth = 1;
		for (var i = 0; i <= configuration.size; i++) {
			ctx.beginPath();
			ctx.moveTo(i * configuration.scale, 0);
			ctx.lineTo(i * configuration.scale, html.canvas.height);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, i * configuration.scale);
			ctx.lineTo(html.canvas.height, i * configuration.scale);
			ctx.closePath();
			ctx.stroke();
		}
	}

	preview() {
		for (var i = 0; i < configuration.size; i++) {
			for (var j = 0; j < configuration.size; j++) {
				ctxP.beginPath();
				ctxP.fillStyle = rgba(this.sprite[i][j]);
				ctxP.fillRect(i, j, 1, 1);
				ctxP.closePath();
			}
		}
	}

	render() {
		for (var i = 0; i < configuration.size; i++) {
			for (var j = 0; j < configuration.size; j++) {
				ctx.beginPath();
				ctx.fillStyle = rgba(this.sprite[i][j]);
				ctx.fillRect(i * configuration.scale, j * configuration.scale, configuration.scale, configuration.scale);
				ctx.closePath();
			}
		}
	}

	toggleColorVary() {
		this.colorVary = !this.colorVary;
	}
}

var sprite = new Sprite(true);

function resetCanvas() {
	html.canvas.width = configuration.size * configuration.scale;
	html.canvas.height = configuration.size * configuration.scale;
	html.preview.width = configuration.size;
	html.preview.height = configuration.size;
}

resetCanvas();

const color = new Ractive({
	el: '#color',
	template: '<div style="background-color:rgba({{red}},{{green}},{{blue}},{{alpha}})"></div>',
	data: {
		red: configuration.color.r,
		green: configuration.color.g,
		blue: configuration.color.b,
		alpha: configuration.color.a,
	}
});

interface Option {
	id: string,
	title?: string,
	template: string,
	selected: string,
	min?: string,
	max?: string,
	options?: Array<{
		label: string,
		value: string,
	}>,
	cb: Function,
}

const options: Array<Option> = [];
const _options: Object = {};

options.push({
	id: 'red',
	template: templates.slider,
	selected: configuration.color.r.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Red (' + value + ')');
		color.set('red', value);
		configuration.color.r = value;
	},
});

options.push({
	id: 'green',
	template: templates.slider,
	selected: configuration.color.g.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Green (' + value + ')');
		color.set('green', value);
		configuration.color.g = value;
	},
});

options.push({
	id: 'blue',
	template: templates.slider,
	selected: configuration.color.b.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Blue (' + value + ')');
		color.set('blue', value);
		configuration.color.b = value;
	},
});

options.push({
	id: 'alpha',
	template: templates.slider,
	selected: Math.round(configuration.color.a * 100).toString(),
	max: '100',
	cb: function(value, ractive) {
		ractive.set('title', 'Alpha (' + value + ')');
		color.set('alpha', value / 100);
		configuration.color.a = value / 100;
	},
});

options.push({
	id: 'brush-size',
	template: templates.slider,
	selected: configuration.brushSize.toString(),
	min: '1',
	max: '5',
	cb: function(value, ractive) {
		ractive.set('title', 'Brush Size (' + value + ')');
		configuration.brushSize = value;
	}
});

options.push({
	id: 'color-variation',
	title: 'Color Variation',
	template: templates.checkbox,
	selected: '',
	cb: function() {
		sprite.toggleColorVary();
	}
});

options.push({
	id: 'grid',
	title: 'Show Grid',
	template: templates.checkbox,
	selected: 'checked',
	cb: function() {
		configuration.showGrid = !configuration.showGrid;
	}
});

options.push({
	id: 'pixel-scale',
	title: 'Pixel Scale',
	template: templates.dropdown,
	selected: scaleSize.Medium.toString(),
	options: [
		{
			value: scaleSize.Original.toString(),
			label: 'Original',
		},
		{
			value: scaleSize.Small.toString(),
			label: 'Small (' + scaleSize.Small + ')',
		},
		{
			value: scaleSize.Medium.toString(),
			label: 'Medium (' + scaleSize.Medium + ')',
		},
		{
			value: scaleSize.Large.toString(),
			label: 'Large (' + scaleSize.Large + ')',
		}
	],
	cb: function(value) {
		configuration.scale = value;
		resetCanvas();
	},
});

options.push({
	id: 'sprite-size',
	title: 'Sprite Size',
	template: templates.dropdown,
	selected: tileSize.Medium.toString(),
	options: [
		{
			value: tileSize.Small.toString(),
			label: 'Small (' + tileSize.Small + 'x' + tileSize.Small + ')',
		},
		{
			value: tileSize.Medium.toString(),
			label: 'Medium (' + tileSize.Medium + 'x' + tileSize.Medium + ')',
		},
		{
			value: tileSize.Large.toString(),
			label: 'Large (' + tileSize.Large + 'x' + tileSize.Large + ')',
		},
	],
	cb: function(value) {
		configuration.size = value;
		resetCanvas();
	},
});

options.forEach((option) => {
	const div = <HTMLDivElement>document.createElement('div');
	div.id = 'option-' + option.id;
	html.toolbar.appendChild(div);

	_options[option.id] = new Ractive({
		el: '#option-' + option.id,
		template: option.template,
		data: {
			id: option.id,
			title: option.title || option.id,
			min: option.min || '0',
			max: option.max || '255',
			options: option.options || [],
		}
	});
	_options[option.id].set('selectedValue', option.selected);
	_options[option.id].observe('selectedValue', function(newValue) {
		option.cb(newValue, _options[option.id]);
	});
});

var newOption = <HTMLButtonElement>document.createElement('button');
newOption.id = 'option-new';
newOption.innerHTML = 'New';
newOption.onclick = function() {
	sprite = new Sprite(sprite.colorVary);
}

html.toolbar.appendChild(newOption);

var saveOption = <HTMLButtonElement>document.createElement('button');
saveOption.id = 'option-save';
saveOption.innerHTML = 'Download';
saveOption.onclick = function() {
	var image = html.preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
	location.href = image;
}

html.toolbar.appendChild(saveOption);

var link = <HTMLParagraphElement>document.createElement('p');
link.innerHTML = '<a href="https://github.com/deificx/sprite">project on github</a>';
html.toolbar.appendChild(link);

function renderBrush() {
	ctx.beginPath();
	ctx.strokeStyle = '#0f0';
	ctx.lineWidth = 2;
	ctx.arc(mouse.x, mouse.y, (configuration.brushSize * configuration.scale / 2), 0, Math.PI * 2);
	ctx.stroke();
	ctx.closePath();
}

function update() {
	requestAnimationFrame(update);
	ctx.clearRect(0, 0, html.canvas.width, html.canvas.height);
	ctxP.clearRect(0, 0, html.preview.width, html.preview.height);
	sprite.preview();
	sprite.render();
	if (configuration.showGrid && configuration.scale != scaleSize.Original) {
		sprite.grid();
	}
	renderBrush();
}

requestAnimationFrame(update);

function draw() {
	sprite.draw(Math.floor(mouse.x / configuration.scale), Math.floor(mouse.y / configuration.scale));
}

function setMouse(mouseEvent: MouseEvent) {
	var rect = html.canvas.getBoundingClientRect();
	mouse = {
		x: mouseEvent.clientX - rect.left,
		y: mouseEvent.clientY - rect.top,
	};
}

var drawing = false;

html.canvas.onmousedown = function(mouseEvent: MouseEvent) {
	setMouse(mouseEvent);
	drawing = true;
	draw();
};

html.canvas.onmousemove = function(mouseEvent: MouseEvent) {
	setMouse(mouseEvent);
	if (drawing) {
		draw();
	}
};

html.canvas.onmouseup = function(event) {
	drawing = false;
};

html.canvas.onmouseleave = function(event) {
	drawing = false;
};
