import { Direction, drawPoint } from "game";
import { isSpreadElement } from "typescript";
import { OUTER_POINT_SIZE, Point, POINT_SIZE, Rect } from "./game";

const DELAY_HEIGHT = 100;
const DROP_SPEED = 1 / 30; // how many pixels to move per ms
export class Piece {
	public y: number;
	private direction: Direction;

	constructor(
		private canvas: HTMLCanvasElement,
		private context: CanvasRenderingContext2D,
		lowestY: number // the lowest Y of any existing piece
	) {
		this.direction = getRandomDirection();
		this.y = Math.min(lowestY - DELAY_HEIGHT, 0);
	}

	public update(timeDelta: number) {
		this.y += timeDelta * DROP_SPEED;
	}

	public shouldDelete(): boolean {
		return this.y > this.canvas.height;
	}

	public didCapture(activeArea: Rect): boolean {
		return isPointInArea({ x: this.getX(), y: this.y + POINT_SIZE }, activeArea);
	}

	public draw() {
		drawPoint(this.context, { x: this.getX(), y: this.y }, "black", OUTER_POINT_SIZE);
		drawPoint(this.context, { x: this.getX(), y: this.y }, "#F15BB5");
	}

	private getX(): number {
		let cellWidth = this.canvas.width / 4;
		let left = cellWidth / 2;

		switch (this.direction) {
			case Direction.UP:
				return left + cellWidth * 0;
			case Direction.DOWN:
				return left + cellWidth * 1;
			case Direction.LEFT:
				return left + cellWidth * 2;
			case Direction.RIGHT:
				return left + cellWidth * 3;
		}
	}
}

function getRandomDirection() {
	let directions = [
		Direction.UP,
		Direction.DOWN,
		Direction.LEFT,
		Direction.RIGHT
	];
	return directions[Math.floor(Math.random() * directions.length)];
}

function isPointInArea(point: Point, activeArea: Rect): boolean {
	if (point.x < activeArea.x || point.x > activeArea.x + activeArea.width) {
		return false;
	}

	if (point.y < activeArea.y || point.y > activeArea.y + activeArea.height) {
		return false;
	}

	return true;
}