/// <reference path="../typings/index.d.ts" />

declare var require: {
	<T>(path: string): T;
	(paths: string[], callback: (...modules: any[]) => void): void;
	ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

require('./index.css');
import html from './html.ts';
import templates from './templates.ts';
import Sprite from './Sprite.ts';
import Ractive = require('ractive');
Ractive.DEBUG = false;

import {
	Configuration,
	Coordinate,
	Option,
	RGBA,
} from './interfaces.ts';

import {
	scaleSize,
	tileSize,
} from './enums.ts';

var config: Configuration = {
	brushSize: 1,
	color: {
		r: 0,
		g: 0,
		b: 0,
		a: 1,
	},
	colorVary: true,
	ctx: html.canvas.getContext('2d'),
	ctxP: html.preview.getContext('2d'),
	scale: scaleSize.Medium,
	showGrid: false,
	size: tileSize.Medium,
};

var mouse: Coordinate = {
	x: 0,
	y: 0,
};

var sprite = new Sprite(html.canvas, config);

function resetCanvas() {
	html.canvas.width = config.size * config.scale;
	html.canvas.height = config.size * config.scale;
	html.preview.width = config.size * 3;
	html.preview.height = config.size * 3;
}

resetCanvas();

const color = new Ractive({
	el: '#color',
	template: 'Selected Color <div style="background-color:rgba({{red}},{{green}},{{blue}},{{alpha}})"></div>',
	data: {
		red: config.color.r,
		green: config.color.g,
		blue: config.color.b,
		alpha: config.color.a,
	}
});

const eyeDropper = new Ractive({
	el: '#eyeDropper',
	template: 'Eye Dropper (e)<div style="background-color:rgba({{red}},{{green}},{{blue}},{{alpha}})"></div>',
	data: {
		red: config.color.r,
		green: config.color.g,
		blue: config.color.b,
		alpha: config.color.a,
	}
});

const options: Array<Option> = [];
const _options: Object = {};

options.push({
	id: 'red',
	template: templates.slider,
	selected: config.color.r.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Red (' + value + ')');
		color.set('red', value);
		config.color.r = parseInt(value, 10);
	},
});

options.push({
	id: 'green',
	template: templates.slider,
	selected: config.color.g.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Green (' + value + ')');
		color.set('green', value);
		config.color.g = parseInt(value, 10);
	},
});

options.push({
	id: 'blue',
	template: templates.slider,
	selected: config.color.b.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Blue (' + value + ')');
		color.set('blue', value);
		config.color.b = parseInt(value, 10);
	},
});

options.push({
	id: 'alpha',
	template: templates.slider,
	selected: Math.round(config.color.a * 100).toString(),
	max: '100',
	cb: function(value, ractive) {
		ractive.set('title', 'Alpha (' + value + ')');
		color.set('alpha', value / 100);
		config.color.a = value / 100;
	},
});

options.push({
	id: 'brush-size',
	template: templates.slider,
	selected: config.brushSize.toString(),
	min: '1',
	max: '16',
	cb: function(value, ractive) {
		ractive.set('title', 'Brush Size (' + value + ')');
		config.brushSize = parseInt(value, 10);;
	}
});

options.push({
	id: 'color-variation',
	title: 'Color Variation',
	template: templates.checkbox,
	selected: '',
	cb: function() {
		config.colorVary = !config.colorVary;
	}
});

options.push({
	id: 'grid',
	title: 'Show Grid',
	template: templates.checkbox,
	selected: 'checked',
	cb: function() {
		config.showGrid = !config.showGrid;
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
		config.scale = value;
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
		config.size = value;
		resetCanvas();
	},
});

options.push({
	id: 'new',
	title: 'New',
	template: templates.button,
	handler: function() {
		sprite = new Sprite(html.canvas, config);
	}
});

options.push({
	id: 'save',
	title: 'Save',
	template: templates.button,
	handler: function() {
		html.preview.width = config.size;
		html.preview.height = config.size;
		sprite.preview(true);
		var image = html.preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
		location.href = image;
		html.preview.width = config.size * 3;
		html.preview.height = config.size * 3;
	}
});

options.push({
	id: 'link',
	template: `
		<p>
			<a href="https://github.com/deificx/sprite" target="_blank" rel="noopener noreferrer">project on github</a>
		</p>`,
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
	if (option.selected) {
		_options[option.id].set('selectedValue', option.selected);
	}
	if (option.cb) {
		_options[option.id].observe('selectedValue', function(newValue) {
			option.cb(newValue, _options[option.id]);
		});
	}
	if (option.handler) {
		_options[option.id].on('handle', function() {
			option.handler();
		});
	}
});

function renderBrush() {
	config.ctx.beginPath();
	config.ctx.strokeStyle = '#000';
	config.ctx.lineWidth = 1;
	config.ctx.arc(mouse.x, mouse.y, (config.brushSize * config.scale / 2), 0, Math.PI * 2);
	config.ctx.stroke();
	config.ctx.closePath();
	config.ctx.beginPath();
	config.ctx.rect(mouse.x - 1, mouse.y - 1, 3, 3);
	config.ctx.stroke();
	config.ctx.closePath();
	config.ctx.beginPath();
	config.ctx.strokeStyle = '#fff';
	config.ctx.lineWidth = 1;
	config.ctx.arc(mouse.x, mouse.y, (config.brushSize * config.scale / 2) - 1, 0, Math.PI * 2);
	config.ctx.stroke();
	config.ctx.closePath();
	config.ctx.beginPath();
	config.ctx.rect(mouse.x, mouse.y, 1, 1);
	config.ctx.stroke();
	config.ctx.closePath();
}

function update() {
	requestAnimationFrame(update);
	config.ctx.clearRect(0, 0, html.canvas.width, html.canvas.height);
	config.ctxP.clearRect(0, 0, html.preview.width, html.preview.height);
	sprite.preview(false);
	sprite.render();
	if (config.showGrid && config.scale != scaleSize.Original) {
		sprite.grid();
	}
	renderBrush();
}

requestAnimationFrame(update);

function getX() {
	return Math.floor(mouse.x / config.scale);
}

function getY() {
	return Math.floor(mouse.y / config.scale);
}

function setMouse(mouseEvent: MouseEvent) {
	var rect = html.canvas.getBoundingClientRect();
	mouse = {
		x: mouseEvent.clientX - rect.left,
		y: mouseEvent.clientY - rect.top,
	};
}

function insideBrush(x: number, y: number, radius: number): Array<Coordinate> {
	var coords = [];
	for (var i = x - radius; i < x + radius; i++) {
		for (var j = y - radius; j < y + radius; j++) {
			if (Math.pow(i - x, 2) + Math.pow(j - y, 2) < radius) {
				coords.push({x:i, y:j});
			}
		}
	}
	return coords;
}

function draw() {
	if (config.brushSize === 1) {
		sprite.draw(getX(), getY());
	} else {
		sprite.brush(getX(), getY(), insideBrush(getX(), getY(), config.brushSize));
	}
}

html.canvas.onmousedown = function(mouseEvent: MouseEvent) {
	setMouse(mouseEvent);
	sprite.startDrawing();
	draw();
};

html.canvas.onmousemove = function(mouseEvent: MouseEvent) {
	setMouse(mouseEvent);
	if (sprite.drawing) {
		draw();
	} else {
		const c = sprite.eyeDropper(getX(), getY());
		eyeDropper.set('red', c.r);
		eyeDropper.set('green', c.g);
		eyeDropper.set('blue', c.b);
		eyeDropper.set('alpha', c.a);
	}
};

html.canvas.onmouseup = function(event) {
	sprite.stopDrawing();
};

html.canvas.onmouseleave = function(event) {
	sprite.stopDrawing();
};

document.addEventListener('keydown', function(event) {
	if (event.key === 'e') {
		const c = sprite.eyeDropper(getX(), getY());
		_options['red'].set('selectedValue', c.r);
		_options['green'].set('selectedValue', c.g);
		_options['blue'].set('selectedValue', c.b);
		_options['alpha'].set('selectedValue', c.a * 100);
	}
});
