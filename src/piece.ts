import { Direction, drawPoint } from "game";

const DELAY_HEIGHT = 100;

export class Piece {
	public y: number;
	private direction: Direction;

	constructor(
		private canvas: HTMLCanvasElement,
		private context: CanvasRenderingContext2D,
		private lowestY: number // the lowest Y of any existing piece
	) {
		this.direction = getRandomDirection();
		this.y = Math.min(lowestY - DELAY_HEIGHT, 0);
	}

	public update() {
		this.y += 5;
	}

	public shouldDelete(): boolean {
		return this.y > this.canvas.height;
	}

	public draw() {
		drawPoint(this.context, { x: this.getX(), y: this.y }, "blue");
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
