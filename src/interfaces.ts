export interface RGBA {
	r?: number,
	g?: number,
	b?: number,
	a?: number,
}

export interface Configuration {
	brushSize: number,
	color: RGBA,
	scale: number,
	showGrid: boolean,
	size: number,
}

export interface MousePos {
	x: number,
	y: number,
}
