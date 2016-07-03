export interface RGBA {
	r?: number,
	g?: number,
	b?: number,
	a?: number,
	empty?: boolean,
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

export interface Coordinate {
	x: number,
	y: number,
}

export interface Option {
	id: string,
	template: string,
	title?: string,
	selected?: string,
	min?: string,
	max?: string,
	options?: Array<{
		label: string,
		value: string,
	}>,
	cb?: Function,
	handler?: Function,
}
