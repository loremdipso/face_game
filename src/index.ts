import * as faceapi from "face-api.js";
import { FaceExpressionNet } from "face-api.js";
import { Game } from "game";


export async function init() {
	await Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
		faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
		faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
		faceapi.nets.faceExpressionNet.loadFromUri("./models"),
	]);

	const stream = await navigator.mediaDevices.getUserMedia({
		video: true
	});

	const videoEl = document.getElementById('video') as HTMLVideoElement;
	videoEl.srcObject = stream;
	let videoCanvas: HTMLCanvasElement = null;
	let videoGroup = document.getElementsByClassName("videoGroup")[0];

	let game = new Game(videoEl);

	videoEl.addEventListener('play', () => {
		// ### Creating a Canvas Element from an Image or Video Element
		videoCanvas = faceapi.createCanvasFromMedia(videoEl);
		videoGroup.append(videoCanvas);

		// ### Init configs
		const rect = videoEl.getBoundingClientRect();
		const displayValues = {
			width: rect.width,
			height: rect.height
		};

		// ### Resize media elements
		faceapi.matchDimensions(videoCanvas, displayValues)

		setInterval(async () => {
			let detections =
				await faceapi.detectAllFaces(
					videoEl as any,
					new faceapi.TinyFaceDetectorOptions()
				)
					.withFaceLandmarks() // detect landmark
					.withFaceDescriptors(); // detect descriptor around face

			detections = faceapi.resizeResults(
				detections,
				displayValues
			);

			// ### Clear before picture
			videoCanvas
				.getContext('2d')
				.clearRect(0, 0, videoCanvas.width, videoCanvas.height)

			for (let i = 0; i < detections.length; i++) {
				game.handleFace(detections[i].detection.box, detections[i].landmarks);
			}

			// ### Drawing  in to VideoCanvas
			faceapi.draw.drawDetections(videoCanvas, detections);
		}, 100);
	})

}



// TODO: remove
if (!(window as any).did_load) {
	(window as any).did_load = true;
	// TODO: can we make this a singleton?
	init();
}