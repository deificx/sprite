/// <reference path="../typings/index.d.ts" />

const canvas = <HTMLCanvasElement>document.createElement('canvas');
canvas.id = "sprite-editor";

const preview = <HTMLCanvasElement>document.createElement('canvas');
preview.id = "sprite-preview";

const color = <HTMLDivElement>document.createElement('div');
color.id = "color";

const eyeDropper = <HTMLDivElement>document.createElement('div');
eyeDropper.id = "eyeDropper";

const toolbar = <HTMLDivElement>document.createElement('div');
toolbar.id = "toolbar";

toolbar.appendChild(preview);
toolbar.appendChild(color);
toolbar.appendChild(eyeDropper);

document.body.appendChild(canvas);
document.body.appendChild(toolbar);

const html = {
	canvas: canvas,
	color: color,
	eyeDropper: eyeDropper,
	preview: preview,
	toolbar: toolbar,
};

export default html;
