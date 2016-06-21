export interface RGBA {
	r?: number,
	g?: number,
	b?: number,
	a?: number,
}

export interface Configuration {
	brushSize: number,
	color: RGBA,
	colorVary: boolean,
	ctx: CanvasRenderingContext2D,
	ctxP: CanvasRenderingContext2D,
	scale: number,
	showGrid: boolean,
	size: number,
}

export interface MousePos {
	x: number,
	y: number,
}
