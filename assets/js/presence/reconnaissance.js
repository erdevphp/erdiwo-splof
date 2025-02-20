document.addEventListener('DOMContentLoaded', async function () {
    const video = document.getElementById('video');
    const captureButton = document.getElementById('capture');
    const canvas = document.getElementById('canvas');
    navigator.mediaDevices.getUserMedia({video:true})
    .then(stream => {video.srcObject = stream;})
    .catch(err => console.error("Erreur d'accès à la webcam : ", err));

    captureButton.addEventListener('click', async function () {
        canvas.removeAttribute('class');
        let context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    });
});

