/// <reference path="typings/index.d.ts" />

Ractive.DEBUG = true;

var canvas = <HTMLCanvasElement>document.getElementById('sprite-editor');
var preview = <HTMLCanvasElement>document.getElementById('sprite-preview');
var ctx: CanvasRenderingContext2D = canvas.getContext('2d');
var ctxP: CanvasRenderingContext2D = preview.getContext('2d');

enum scaleSize {
	Small = 8,
	Medium = 16,
	Large = 24,
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

function rgb(color: RGBA) {
	return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
}

function rgba(color: RGBA) {
	return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}

class Sprite {
	color: RGBA;
	size: tileSize;
	sprite: Array<Array<RGBA>>;

	constructor(spriteSize: tileSize) {
		this.color = {
			r: 0,
			g: 0,
			b: 0,
		};
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

	draw(x: number, y: number) {
		if (typeof this.sprite[x] !== 'undefined' && typeof this.sprite[x][y] !== 'undefined') {
			this.sprite[x][y] = {
				r: this.color.r,
				g: this.color.g,
				b: this.color.b
			};
		}
	}

	grid() {
		ctx.strokeStyle = rgba({ r: 128, g: 128, b: 128, a: 0.5 });
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

	setColor(color: RGBA) {
		this.color = color;
	}
}

var sprite = new Sprite(size);

function resetCanvas() {
	canvas.width = size * scale;
	canvas.height = size * scale;
	preview.width = size;
	preview.height = size;
}

resetCanvas();

const scaleOption = new Ractive({
	el: '#option-scale',
	template: '#dropdown',
	data: {
		id: 'pixel-scale',
		title: 'Pixel Scale',
		options: [
			{
				value: scaleSize.Small.toString(),
				label: 'Small',
			},
			{
				value: scaleSize.Medium.toString(),
				label: 'Medium',
			},
			{
				value: scaleSize.Large.toString(),
				label: 'Large',
			}
		],
	},
});

scaleOption.set('selectedOption', scaleSize.Medium.toString());
scaleOption.observe('selectedOption', function(newValue) {
	scale = newValue;
	resetCanvas();
});

const sizeOption = new Ractive({
	el: '#option-size',
	template: '#dropdown',
	data: {
		id: 'sprite-size',
		title: 'Sprite Size',
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
	}
});

sizeOption.set('selectedOption', tileSize.Medium.toString());
sizeOption.observe('selectedOption', function(newValue) {
	size = newValue;
	sprite = new Sprite(size);
	resetCanvas();
});

const redOption = new Ractive({
	el: '#option-red',
	template: '#slider',
	data: {
		id: 'red',
		min: '0',
		max: '255',
	},
});

redOption.set('selectedValue', sprite.color.r);
redOption.observe('selectedValue', (newValue) => {
	redOption.set('title', 'Red (' + newValue + ')');
	sprite.setColor({
		r: newValue,
		g: sprite.color.g,
		b: sprite.color.b,
	});
});

const greenOption = new Ractive({
	el: '#option-green',
	template: '#slider',
	data: {
		id: 'green',
		min: '0',
		max: '255',
	},
});

greenOption.set('selectedValue', sprite.color.r);
greenOption.observe('selectedValue', (newValue) => {
	greenOption.set('title', 'Green (' + newValue + ')');
	sprite.setColor({
		r: sprite.color.r,
		g: newValue,
		b: sprite.color.b,
	});
});

const blueOption = new Ractive({
	el: '#option-blue',
	template: '#slider',
	data: {
		id: 'blue',
		min: '0',
		max: '255',
	},
});

blueOption.set('selectedValue', sprite.color.r);
blueOption.observe('selectedValue', (newValue) => {
	blueOption.set('title', 'Blue (' + newValue + ')');
	sprite.setColor({
		r: sprite.color.r,
		g: sprite.color.g,
		b: newValue,
	});
});

var saveOption = <HTMLButtonElement>document.getElementById('option-save');
var save: boolean = false;
saveOption.onclick = function() {
	save = true;
}

var gridOption = <HTMLInputElement>document.getElementById('option-grid');
var showGrid: boolean = true;
gridOption.onchange = function() {
	showGrid = !showGrid;
}

var image = null;
function update() {
	requestAnimationFrame(update);
	sprite.preview();
	sprite.render();
	if (showGrid) {
		sprite.grid();
	}
	if (save) {
		save = false;
		image = preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
		location.href = image;
	}
}

requestAnimationFrame(update);

function pixelate(mouseEvent: MouseEvent) {
	var rect = canvas.getBoundingClientRect();
	var x = Math.floor((mouseEvent.clientX - rect.left) / scale);
	var y = Math.floor((mouseEvent.clientY - rect.top) / scale);
	sprite.draw(x, y);
}

var drawing = false;

canvas.onmousedown = function(event) {
	drawing = true;
	pixelate(event);
};

canvas.onmousemove = function(event) {
	if (drawing) {
		pixelate(event);
	}
};

canvas.onmouseup = function(event) {
	drawing = false;
};

canvas.onmouseleave = function(event) {
	drawing = false;
};
