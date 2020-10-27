import * as faceapi from "face-api.js";

const POINT_SIZE = 5;
const POINT_COLOR = "red";

interface Point {
	x: number,
	y: number,
}

export class Game {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor(private siblingEl: Element) {
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
		this.siblingEl.parentElement.appendChild(this.canvas);
		(this.siblingEl as HTMLElement).addEventListener("resize", () => {
			this.resizeCanvas();
		});

		this.resizeCanvas();
	};

	private resizeCanvas() {
		this.canvas.width = this.siblingEl.clientWidth;
		this.canvas.height = this.siblingEl.clientHeight;
		this.canvas.style.backgroundColor = "rgba(0,255,0,0.2)";
	}

	public handleFace(landmarks: faceapi.FaceLandmarks68) {
		// this.drawCircle(this.getCenter(landmarks.getLeftEye()));
		this.drawPoint(this.getCenter(landmarks.getLeftEye()));
	}

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

	private drawPoint(center: Point) {
		this.context.save();
		this.context.beginPath();
		this.context.fillStyle = POINT_COLOR;
		this.context.arc(center.x, center.y, POINT_SIZE, 0, 2 * Math.PI);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}
}