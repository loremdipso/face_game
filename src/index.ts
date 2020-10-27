import * as faceapi from "face-api.js";


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

	const videoEl = document.getElementById('video');
	const video = videoEl as HTMLVideoElement;
	video.srcObject = stream;
	let videoCanvas: HTMLCanvasElement = null;
	let videoGroup = document.getElementsByClassName("videoGroup")[0];

	video.addEventListener('play', () => {
		// ### Creating a Canvas Element from an Image or Video Element
		videoCanvas = faceapi.createCanvasFromMedia(video);
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

			const detections =
				await faceapi.detectAllFaces(
					video as any,
					new faceapi.TinyFaceDetectorOptions()
				)
					.withFaceLandmarks() // detect landmark
					.withFaceDescriptors(); // detect descriptor around face

			// ### Input in to console result's detection
			// detections.map(console.log)

			const resizedDetections = faceapi.resizeResults(
				detections,
				displayValues
			);

			// ### Clear before picture
			videoCanvas
				.getContext('2d')
				.clearRect(0, 0, videoCanvas.width, videoCanvas.height)

			// ### Drawing  in to VideoCanvas
			faceapi.draw.drawDetections(videoCanvas, resizedDetections);

		}, 100);
	})
}


// TODO: remove
if (!(window as any).did_load) {
	(window as any).did_load = true;
	// TODO: can we make this a singleton?
	init();
}