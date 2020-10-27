import * as faceapi from "face-api.js";

const POINT_SIZE = 5;
const POINT_COLOR = "red";
const DIRECTION_COLOR = "red";
const DIRECTION_SIZE = 10;

enum Direction {
	UP = "up",
	DOWN = "down",
	LEFT = "left",
	RIGHT = "right"
}

interface Point {
	x: number,
	y: number,
}

interface Rect {
	x: number,
	y: number,
	height: number,
	width: number,
}

export class Game {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	// =============== API ===============
	constructor(private siblingEl: Element) {
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
		this.siblingEl.parentElement.appendChild(this.canvas);
		(this.siblingEl as HTMLElement).addEventListener("resize", () => {
			this.resizeCanvas();
		});

		this.resizeCanvas();
	};

	public handleFace(bounds: Rect, landmarks: faceapi.FaceLandmarks68) {
		this.clear();
		let nose = this.getCenter(landmarks.getNose());
		this.drawPoint(nose);

		let direction = this.getDirection(bounds, nose);
		// this.printDirection(direction);
		this.drawDirection(direction);
	}

	// =============== utils ===============
	private resizeCanvas() {
		this.canvas.width = this.siblingEl.clientWidth;
		this.canvas.height = this.siblingEl.clientHeight;
		this.canvas.style.backgroundColor = "rgba(0,255,0,0.2)";
	}

	private printDirection(dir: Direction) {
		console.log(dir);
	}

	// =============== geometry ===============
	private getCenter(points: Point[]): Point {
		let center = { x: 0, y: 0 };
		for (let point of points) {
			center.x += point.x;
			center.y += point.y;
		}
		center.x /= points.length;
		center.y /= points.length;
		return center;
	}

	private getDirection(bounds: Rect, nose: Point): Direction {
		// idea: find out which point the nose is closest to
		let keyPoints = [
			{ direction: Direction.UP, point: { x: bounds.x + bounds.width / 2, y: bounds.y } },
			{ direction: Direction.DOWN, point: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height } },
			{ direction: Direction.LEFT, point: { x: bounds.x, y: bounds.y + bounds.height / 2 } },
			{ direction: Direction.RIGHT, point: { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 } }
		];

		let minDistance = -1;
		let direction = Direction.UP;
		for (let point of keyPoints) {
			let distance = getDistance(point.point, nose);
			if (minDistance < 0 || distance < minDistance) {
				minDistance = distance;
				direction = point.direction;
			}
		}

		return direction;
	}


	// =============== drawing ===============
	private clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private drawPoint(center: Point) {
		this.context.save();
		this.context.beginPath();
		this.context.fillStyle = POINT_COLOR;
		this.context.arc(center.x, center.y, POINT_SIZE, 0, 2 * Math.PI);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}

	private drawDirection(direction: Direction) {
		let width = this.canvas.width;
		let height = this.canvas.height;

		this.context.save();
		this.context.beginPath();
		this.context.fillStyle = DIRECTION_COLOR;

		switch (direction) {
			case Direction.UP:
				this.context.rect(0, 0, width, DIRECTION_SIZE);
				break;
			case Direction.DOWN:
				this.context.rect(0, height - DIRECTION_SIZE, width, DIRECTION_SIZE);
				break;
			case Direction.LEFT:
				this.context.rect(0, 0, DIRECTION_SIZE, height);
				break;
			case Direction.RIGHT:
				this.context.rect(width - DIRECTION_SIZE, 0, DIRECTION_SIZE, height);
				break;
		}
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}
}

function getDistance(p1: Point, p2: Point): number {
	return Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
}