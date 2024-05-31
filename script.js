const startCameraButton = document.getElementById('startCamera');
const snapButton = document.getElementById('snap');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const resultText = document.getElementById('result');
let videoStream;

startCameraButton.addEventListener('click', startCamera);

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById('video');
            videoStream = stream; // Store the stream reference for later use
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play(); // Automatically play the video
            };
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });
}
snapButton.addEventListener('click', takeSnapshot);

function takeSnapshot() {
    if (!videoStream || video.paused) {
        console.error('Camera stream not available or not playing');
        return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');

    // Perform face recognition on the snapshot
    recognizeFace(imageData);
}

async function recognizeFace(imageData) {
    const detections = await faceapi.detectAllFaces(imageData).withFaceLandmarks();
  
    if (detections.length > 0) {
        const landmarks = detections[0].landmarks;
        const jawOutline = landmarks.getJawOutline();
        const mouth = landmarks.getMouth();

        // Simple heuristic to check for a beard
        const jawWidth = jawOutline[16].x - jawOutline[0].x;
        const mouthWidth = mouth[6].x - mouth[0].x;
        const ratio = mouthWidth / jawWidth;

        if (ratio < 0.4) { // If mouth is significantly smaller than jaw, likely a beard
            resultText.innerText = "You have a beard!";
        } else {
            resultText.innerText = "You don't have a beard.";
        }
    } else {
        resultText.innerText = "No face detected.";
    }
}

// Load face-api models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
]).then(() => {
    console.log('Face-api models loaded');
});
