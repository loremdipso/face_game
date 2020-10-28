import * as faceapi from "face-api.js";
import { Piece } from "piece";

export const POINT_SIZE = 20;
export const OUTER_POINT_SIZE = POINT_SIZE + 10;
const DIRECTION_SIZE = 10;
const DIRECTION_BACKGROUND_SIZE = 60;
const NUM_PIECES = 10;
const VICTORY_DURATION = 1000; // ms?

export enum Direction {
	UP = "up",
	DOWN = "down",
	LEFT = "left",
	RIGHT = "right"
}

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

class GameState {
	pieces: Piece[] = [];
	direction: Direction;
	nose: Point = { x: 0, y: 0 };
	victory: number;
	score: number = 0;
}

export class Game {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	state = new GameState();

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

	public start() {
		// TODO: use the good animation frame stuff
		let lastUpdate = Date.now();

		// TODO: cap the framerate on this
		const cb = () => {
			let delta = Date.now() - lastUpdate;
			lastUpdate = Date.now();
			this.update(delta);
			this.draw();
			window.requestAnimationFrame(cb);
		};
		window.requestAnimationFrame(cb);
	}

	public handleFace(
		bounds: Rect,
		landmarks: faceapi.FaceLandmarks68,
		expressions: faceapi.FaceExpressions
	) {
		this.state.nose = this.getCenter(landmarks.getNose());
		this.state.direction = this.getDirectionFromNose(bounds, this.state.nose);
		this.state.direction = this.getDirectionFromExpressions(expressions);
	}

	// =============== game state ===============
	private update(delta: number) {
		let delay = 0;
		while (this.state.pieces.length < NUM_PIECES) {
			let lowestY = this.canvas.height;
			if (this.state.pieces.length > 0) {
				lowestY = this.state.pieces[this.state.pieces.length - 1].y;
			}
			this.state.pieces.push(new Piece(this.canvas, this.context, lowestY));
			delay++;
		}

		for (let i = this.state.pieces.length - 1; i >= 0; i--) {
			let piece = this.state.pieces[i];
			piece.update(delta);

			if (piece.shouldDelete()) {
				this.state.pieces.splice(i, 1);
			} else {
				let victoryBox = this.getActiveSectionBoundingBox();
				if (piece.didCapture(victoryBox)) {
					this.state.pieces.splice(i, 1);
					this.state.score += 1;
					this.state.victory = Date.now();
				}
			}
		}
	}

	private draw() {
		this.clear();

		// drawPoint(this.context, this.state.nose, "red");
		this.drawDirection(this.state.direction);

		for (let piece of this.state.pieces) {
			piece.draw();
		}
	}

	// =============== utils ===============
	private resizeCanvas() {
		this.canvas.width = this.siblingEl.clientWidth;
		this.canvas.height = this.siblingEl.clientHeight;
		this.canvas.style.backgroundColor = "rgba(0,255,0,0.1)";
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

	private getDirectionFromNose(bounds: Rect, nose: Point): Direction {
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

	private getDirectionFromExpressions(expressions: faceapi.FaceExpressions): Direction {
		let sortedExpressions = expressions.asSortedArray();

		for (let expression of sortedExpressions) {
			// options: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised'
			switch (expression.expression) {
				case "surprised":
					return Direction.UP;
				case "happy":
					return Direction.DOWN;
				case "fearful":
					return Direction.LEFT;
				case "angry":
					return Direction.RIGHT;
			}
		}

		return Direction.LEFT;
	}


	// =============== drawing ===============
	private clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private drawDirection(direction: Direction) {
		let sectionWidth = this.canvas.width / 4;

		let left = 0;
		switch (direction) {
			case Direction.UP:
				left = sectionWidth * 0;
				break;
			case Direction.DOWN:
				left = sectionWidth * 1;
				break;
			case Direction.LEFT:
				left = sectionWidth * 2;
				break;
			case Direction.RIGHT:
				left = sectionWidth * 3;
				break;
		}


		let color = "#9B5DE5";
		if (Date.now() - this.state.victory < VICTORY_DURATION) {
			color = "#00F5D4"
		}

		this.drawSection(left, color);
	}

	private drawSection(left: number, color: string) {
		let sectionWidth = this.canvas.width / 4;
		let sectionBackgroundTop = this.canvas.height - DIRECTION_BACKGROUND_SIZE;
		drawRect(
			this.context,
			{ x: left, y: sectionBackgroundTop, width: sectionWidth, height: DIRECTION_BACKGROUND_SIZE },
			color,
			0.6
		);

		// let sectionTop = this.canvas.height - DIRECTION_SIZE;
		// drawRect(
		// 	this.context,
		// 	{ x: left, y: sectionTop, width: sectionWidth, height: DIRECTION_SIZE },
		// 	color
		// );
	}

	private getActiveSectionBoundingBox(): Rect {
		let sectionWidth = this.canvas.width / 4;

		let left = 0;
		switch (this.state.direction) {
			case Direction.UP:
				left = sectionWidth * 0;
				break;
			case Direction.DOWN:
				left = sectionWidth * 1;
				break;
			case Direction.LEFT:
				left = sectionWidth * 2;
				break;
			case Direction.RIGHT:
				left = sectionWidth * 3;
				break;
		}
		return {
			x: left, y: this.canvas.height - DIRECTION_BACKGROUND_SIZE,
			width: sectionWidth, height: DIRECTION_BACKGROUND_SIZE
		};
	}
}

function getDistance(p1: Point, p2: Point): number {
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
