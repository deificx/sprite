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
	MousePos,
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

var mouse: MousePos = {
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
	template: '<div style="background-color:rgba({{red}},{{green}},{{blue}},{{alpha}})"></div>',
	data: {
		red: config.color.r,
		green: config.color.g,
		blue: config.color.b,
		alpha: config.color.a,
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

// options.push({
// 	id: 'brush-size',
// 	template: templates.slider,
// 	selected: config.brushSize.toString(),
// 	min: '1',
// 	max: '5',
// 	cb: function(value, ractive) {
// 		ractive.set('title', 'Brush Size (' + value + ')');
// 		config.brushSize = parseInt(value, 10);;
// 	}
// });

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
	sprite = new Sprite(html.canvas, config);
}

html.toolbar.appendChild(newOption);

var saveOption = <HTMLButtonElement>document.createElement('button');
saveOption.id = 'option-save';
saveOption.innerHTML = 'Download';
saveOption.onclick = function() {
	html.preview.width = config.size;
	html.preview.height = config.size;
	sprite.preview(true);
	var image = html.preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
	location.href = image;
	html.preview.width = config.size * 3;
	html.preview.height = config.size * 3;
}

html.toolbar.appendChild(saveOption);

var link = <HTMLParagraphElement>document.createElement('p');
link.innerHTML = '<a href="https://github.com/deificx/sprite">project on github</a>';
html.toolbar.appendChild(link);

function renderBrush() {
	config.ctx.beginPath();
	config.ctx.strokeStyle = '#0f0';
	config.ctx.lineWidth = 2;
	config.ctx.arc(mouse.x, mouse.y, (config.brushSize * config.scale / 2), 0, Math.PI * 2);
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

function draw() {
	sprite.draw(Math.floor(mouse.x / config.scale), Math.floor(mouse.y / config.scale));
}

function setMouse(mouseEvent: MouseEvent) {
	var rect = html.canvas.getBoundingClientRect();
	mouse = {
		x: mouseEvent.clientX - rect.left,
		y: mouseEvent.clientY - rect.top,
	};
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
	}
};

html.canvas.onmouseup = function(event) {
	sprite.stopDrawing();
};

html.canvas.onmouseleave = function(event) {
	sprite.stopDrawing();
};
