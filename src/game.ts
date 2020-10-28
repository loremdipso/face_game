import * as faceapi from "face-api.js";
import { Piece } from "./piece";
import { DEBUG, DIRECTION_BACKGROUND_SIZE, drawRect, getDistance, NUM_PIECES, Point, Rect, VICTORY_DURATION } from "./utils";

export enum Direction {
	SURPRISED = "surprised",
	HAPPY = "happy",
	FEARFUL = "fearful",
	ANGRY = "angry"
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

		// catches most vertical resizes (video play, for ex.)
		this.siblingEl.addEventListener("resize", () => { this.resizeCanvas(); });

		// catches rest of resize events
		window.addEventListener("resize", () => { this.resizeCanvas(); });

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

		this.drawDirection(this.state.direction);

		for (let piece of this.state.pieces) {
			piece.draw();
		}

		this.drawScore()
	}

	// =============== utils ===============
	private resizeCanvas() {
		this.canvas.width = this.siblingEl.clientWidth;
		this.canvas.height = this.siblingEl.clientHeight;

		if (DEBUG) {
			this.canvas.style.backgroundColor = "rgba(0,255,0,0.3)";
		}
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

	private getDirectionFromExpressions(expressions: faceapi.FaceExpressions): Direction {
		let sortedExpressions = expressions.asSortedArray();

		for (let expression of sortedExpressions) {
			// options: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised'
			switch (expression.expression) {
				case "surprised":
					return Direction.SURPRISED;
				case "happy":
					return Direction.HAPPY;
				case "fearful":
					return Direction.FEARFUL;
				case "angry":
					return Direction.ANGRY;
			}
		}

		return Direction.FEARFUL;
	}


	// =============== drawing ===============
	private clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private drawScore() {
		let text = `Score: ${this.state.score}`;
		let textHeight = 20; // pixels

		this.context.fillStyle = "white";
		this.context.textBaseline = "top";
		this.context.font = `${textHeight}px Arial`;

		let textWidth = this.context.measureText(text).width;

		drawRect(this.context, {
			x: 0,
			y: 0,
			width: textWidth,
			height: textHeight,
		}, "black");

		this.context.fillText(text, 0, 0);
	}

	private drawDirection(direction: Direction) {
		let sectionWidth = this.canvas.width / 4;

		let left = 0;
		switch (direction) {
			case Direction.SURPRISED:
				left = sectionWidth * 0;
				break;
			case Direction.HAPPY:
				left = sectionWidth * 1;
				break;
			case Direction.FEARFUL:
				left = sectionWidth * 2;
				break;
			case Direction.ANGRY:
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
	}

	private getActiveSectionBoundingBox(): Rect {
		let sectionWidth = this.canvas.width / 4;

		let left = 0;
		switch (this.state.direction) {
			case Direction.SURPRISED:
				left = sectionWidth * 0;
				break;
			case Direction.HAPPY:
				left = sectionWidth * 1;
				break;
			case Direction.FEARFUL:
				left = sectionWidth * 2;
				break;
			case Direction.ANGRY:
				left = sectionWidth * 3;
				break;
		}
		return {
			x: left, y: this.canvas.height - DIRECTION_BACKGROUND_SIZE,
			width: sectionWidth, height: DIRECTION_BACKGROUND_SIZE
		};
	}
}
