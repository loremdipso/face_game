export const POINT_SIZE = 20;
export const OUTER_POINT_SIZE = POINT_SIZE + 10;
export const DIRECTION_BACKGROUND_SIZE = 60;
export const NUM_PIECES = 10;
export const VICTORY_DURATION = 1000; // ms

export const DROP_SPEED = 1 / 20; // how many pixels to move per ms
export const FACE_SIZE = 75;
export const DELAY_HEIGHT = FACE_SIZE * 3;

export const DEBUG = false;

export interface Point {
	x: number,
	y: number,
}

export interface Rect {
	x: number,
	y: number,
	height: number,
	width: number,
}

export function getDistance(p1: Point, p2: Point): number {
	return Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
}

export function drawPoint(context: CanvasRenderingContext2D, center: Point, color: string, radius: number = POINT_SIZE) {
	context.save();
	context.beginPath();
	context.fillStyle = color;
	context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
	context.closePath();
	context.fill();
	context.restore();
}

export function drawRect(context: CanvasRenderingContext2D, rect: Rect, color: string, opacity: number = 1.0) {
	context.save();
	context.beginPath();
	context.globalAlpha = opacity;
	context.fillStyle = color;
	context.fillRect(rect.x, rect.y, rect.width, rect.height);
	context.closePath();
	context.fill();
	context.restore();
}

// export function drawImage(context: CanvasRenderingContext2D, center: Point, image: CanvasImageSource) {
	// context.save();
	// context.beginPath();
	// context.fillStyle = color;
	// context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
	// context.closePath();
	// context.fill();
	// context.restore();
// }