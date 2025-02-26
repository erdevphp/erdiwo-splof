document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initializeFaceApi();
        await startWebcam();

        const profileImage = await loadProfileImage();
        setupCaptureButton(profileImage);
    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
    }
});

// Initialisation de Face-api.js
async function initializeFaceApi() {
    const modelsPath = "/models";
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(modelsPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath)
    ]);
}

// Démarrer la webcam
async function startWebcam() {
    try {
        const video = document.getElementById("video");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Erreur d'accès à la webcam :", error);
    }
}

// Charger l'image de profil
async function loadProfileImage() {
    const profilPicture = document.getElementById("profilPicture").getAttribute("data-picture");
    return await faceapi.fetchImage(`/uploads/profil/${profilPicture}`);
}

// Gestion du bouton de capture
function setupCaptureButton(profileImage) {
    const captureBtn = document.getElementById("capture");
    const statusText = document.getElementById("status");
    const validationBtn = document.getElementById("validationBtn");
    const videoBox = document.getElementById("videoBox");

    captureBtn.addEventListener("click", async () => {
        try {
            griserPage();
            statusText.innerText = "✅ Vérification en cours. Veuillez patienter...";

            const capturedImage = await captureWebcamImage();
            const match = await compareFaces(profileImage, capturedImage);

            if (match) {
                statusText.innerText = "✅ Identité confirmée, accès autorisé !";
                validationBtn.classList.remove("d-none");
                videoBox.innerHTML = ""; // Masquer la vidéo après validation
            } else {
                statusText.innerText = "❌ Échec : Visage non reconnu.";
            }
        } catch (error) {
            console.error("Erreur lors de la vérification :", error);
            statusText.innerText = "⚠️ Erreur lors de la capture de l'image.";
        } finally {
            degriserPage();
        }
    });
}

// Capturer une image depuis la webcam
async function captureWebcamImage() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(faceapi.bufferToImage(blob)) : reject(new Error("Échec de la capture")), "image/png");
    });
}

// Comparer les visages
async function compareFaces(profileImage, capturedImage) {
    const profileDescriptor = await getFaceDescriptor(profileImage);
    const capturedDescriptor = await getFaceDescriptor(capturedImage);

    if (!profileDescriptor || !capturedDescriptor) {
        document.getElementById("status").innerText = "❌ Erreur : Impossible de détecter un visage.";
        return false;
    }

    const distance = faceapi.euclideanDistance(profileDescriptor, capturedDescriptor);
    console.log("Distance entre les visages :", distance);
    return distance < 0.6; // Seuil de reconnaissance
}

// Extraire le descripteur d'un visage
async function getFaceDescriptor(image) {
    const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
    return detection ? detection.descriptor : null;
}

// Effet de gris sur la page pendant le traitement
function griserPage() {
    document.body.style.filter = "grayscale(100%)";
    document.body.style.pointerEvents = "none";
}

// Restaurer la page
function degriserPage() {
    document.body.style.filter = "none";
    document.body.style.pointerEvents = "auto";
}
