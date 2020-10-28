import { Direction } from "./game";
import { Point, Rect, FACE_SIZE, DELAY_HEIGHT, DROP_SPEED } from "./utils";

interface ICachedImage {
	image: HTMLImageElement,
	is_loaded: boolean
};

class ImageLoader {
	private static images: { [key: string]: ICachedImage } = {};
	private static is_setup = false;

	// public api
	public static Setup() {
		if (!ImageLoader.is_setup) {
			ImageLoader.is_setup = true;

			ImageLoader.images[Direction.SURPRISED] = ImageLoader.createImage(Direction.SURPRISED);
			ImageLoader.images[Direction.HAPPY] = ImageLoader.createImage(Direction.HAPPY);
			ImageLoader.images[Direction.FEARFUL] = ImageLoader.createImage(Direction.FEARFUL);
			ImageLoader.images[Direction.ANGRY] = ImageLoader.createImage(Direction.ANGRY);
		}
	}

	public static getImage(direction: Direction): HTMLImageElement | null {
		let result = ImageLoader.images[direction];
		return result.is_loaded ? result.image : null;
	}

	// helpers
	private static createImage(direction: Direction): ICachedImage {
		let image = document.createElement("img");
		image.src = `images/${direction.toString()}.svg`
		image.onload = () => {
			ImageLoader.images[direction].is_loaded = true;
		};

		return { image: image, is_loaded: false };
	}
}

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
		ImageLoader.Setup();
	}



	public update(timeDelta: number) {
		this.y += timeDelta * DROP_SPEED;
	}

	public shouldDelete(): boolean {
		return this.y > this.canvas.height;
	}

	public didCapture(activeArea: Rect): boolean {
		return isPointInArea({ x: this.getX(), y: this.y + FACE_SIZE }, activeArea);
	}

	public draw() {
		let image = ImageLoader.getImage(this.direction);
		if (image) {
			this.context.drawImage(image, this.getX() - FACE_SIZE / 2, this.y, FACE_SIZE, FACE_SIZE);
		}
	}

	private getX(): number {
		let cellWidth = this.canvas.width / 4;
		let left = cellWidth / 2;

		switch (this.direction) {
			case Direction.SURPRISED:
				return left + cellWidth * 0;
			case Direction.HAPPY:
				return left + cellWidth * 1;
			case Direction.FEARFUL:
				return left + cellWidth * 2;
			case Direction.ANGRY:
				return left + cellWidth * 3;
		}
	}
}

function getRandomDirection() {
	let directions = [
		Direction.SURPRISED,
		Direction.HAPPY,
		Direction.FEARFUL,
		Direction.ANGRY
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