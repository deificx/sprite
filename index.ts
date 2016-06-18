/// <reference path="typings/index.d.ts" />

var canvas = <HTMLCanvasElement>document.getElementById('sprite-editor');
var preview = <HTMLCanvasElement>document.getElementById('sprite-preview');
var ctx: CanvasRenderingContext2D = canvas.getContext('2d');
var ctxP: CanvasRenderingContext2D = preview.getContext('2d');

enum scaleSize {
	Original = 1,
	Small = 4,
	Medium = 8,
	Large = 16,
}

enum tileSize {
	Small = 16,
	Medium = 32,
	Large = 64
}

interface RGBA {
	r?: number,
	g?: number,
	b?: number,
	a?: number,
}

var scale: number = scaleSize.Medium;
var size: number = tileSize.Medium;
var showGrid: boolean = false;

function rgb(color: RGBA) {
	return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
}

function rgba(color: RGBA) {
	return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}

function clamp(n, min, max) {
	return n < min ? min : n > max ? max : n;
}

class Sprite {
	brushSize: number;
	color: RGBA;
	colorVary: boolean;
	size: tileSize;
	sprite: Array<Array<RGBA>>;

	constructor(brushSize: number, colorVary: boolean, spriteSize: tileSize) {
		this.brushSize = brushSize;
		this.color = {
			r: 0,
			g: 0,
			b: 0,
		};
		this.colorVary = colorVary;
		this.size = spriteSize;
		this.sprite = [];

		for (var i = 0; i < this.size; i++) {
			var columns = [];
			for (var j = 0; j < this.size; j++) {
				columns.push({
					r: 255,
					g: 255,
					b: 255,
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
				r: this.color.r + rVary,
				g: this.color.g + gVary,
				b: this.color.b + bVary,
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
		for (let i = 1; i <= this.brushSize; i++) {
			if (i < this.brushSize) {
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
		for (var i = 0; i <= size; i++) {
			ctx.beginPath();
			ctx.moveTo(i * scale, 0);
			ctx.lineTo(i * scale, canvas.height);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, i * scale);
			ctx.lineTo(canvas.height, i * scale);
			ctx.closePath();
			ctx.stroke();
		}
	}

	preview() {
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				ctxP.beginPath();
				ctxP.fillStyle = rgb(this.sprite[i][j]);
				ctxP.fillRect(i, j, 1, 1);
				ctxP.closePath();
			}
		}
	}

	render() {
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				ctx.beginPath();
				ctx.fillStyle = rgb(this.sprite[i][j]);
				ctx.fillRect(i * scale, j * scale, scale, scale);
				ctx.closePath();
			}
		}
	}

	setBrushSize(size) {
		this.brushSize = size;
	}

	setColor(color: RGBA) {
		this.color = color;
	}

	toggleColorVary() {
		this.colorVary = !this.colorVary;
	}
}

var sprite = new Sprite(1, true, size);

function resetCanvas() {
	canvas.width = size * scale;
	canvas.height = size * scale;
	preview.width = size;
	preview.height = size;
}

resetCanvas();

const color = new Ractive({
	el: '#color',
	template: '<div style="background-color:rgb({{red}},{{green}},{{blue}})"></div>',
	data: {
		red: sprite.color.r,
		green: sprite.color.g,
		blue: sprite.color.b,
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
	id: 'pixel-scale',
	title: 'Pixel Scale',
	template: 'dropdown',
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
		scale = value;
		resetCanvas();
	},
});

options.push({
	id: 'sprite-size',
	title: 'Sprite Size',
	template: 'dropdown',
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
		size = value;
		resetCanvas();
		sprite = new Sprite(sprite.brushSize, sprite.colorVary, size);
	},
});

options.push({
	id: 'red',
	template: 'slider',
	selected: sprite.color.r.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Red (' + value + ')');
		color.set('red', value);
		sprite.setColor({
			r: value,
			g: sprite.color.g,
			b: sprite.color.b,
		});
	},
});

options.push({
	id: 'green',
	template: 'slider',
	selected: sprite.color.g.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Green (' + value + ')');
		color.set('green', value);
		sprite.setColor({
			r: sprite.color.r,
			g: value,
			b: sprite.color.b,
		});
	},
});

options.push({
	id: 'blue',
	template: 'slider',
	selected: sprite.color.b.toString(),
	cb: function(value, ractive) {
		ractive.set('title', 'Blue (' + value + ')');
		color.set('blue', value);
		sprite.setColor({
			r: sprite.color.r,
			g: sprite.color.g,
			b: value,
		});
	},
});

options.push({
	id: 'brush-size',
	template: 'slider',
	selected: sprite.brushSize.toString(),
	min: '1',
	max: '5',
	cb: function(value) {
		sprite.setBrushSize(value);
	}
});

options.push({
	id: 'color-variation',
	title: 'Color Variation',
	template: 'checkbox',
	selected: '',
	cb: function() {
		sprite.toggleColorVary();
	}
});

options.push({
	id: 'grid',
	title: 'Show Grid',
	template: 'checkbox',
	selected: 'checked',
	cb: function() {
		showGrid = !showGrid;
	}
});

options.forEach((option) => {
	_options[option.id] = new Ractive({
		el: '#option-' + option.id,
		template: '#' + option.template,
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

var saveOption = <HTMLButtonElement>document.getElementById('option-save');
saveOption.onclick = function() {
	image = preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
	location.href = image;
}

var image = null;
function update() {
	requestAnimationFrame(update);
	sprite.preview();
	sprite.render();
	if (showGrid && scale != scaleSize.Original) {
		sprite.grid();
	}
}

requestAnimationFrame(update);

function draw(mouseEvent: MouseEvent) {
	var rect = canvas.getBoundingClientRect();
	var x = Math.floor((mouseEvent.clientX - rect.left) / scale);
	var y = Math.floor((mouseEvent.clientY - rect.top) / scale);
	sprite.draw(x, y);
}

var drawing = false;

canvas.onmousedown = function(event) {
	drawing = true;
	draw(event);
};

canvas.onmousemove = function(event) {
	if (drawing) {
		draw(event);
	}
};

canvas.onmouseup = function(event) {
	drawing = false;
};

canvas.onmouseleave = function(event) {
	drawing = false;
};
