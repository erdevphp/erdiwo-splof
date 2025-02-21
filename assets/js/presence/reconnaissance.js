document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("video");
    const captureBtn = document.getElementById("capture");
    const canvas = document.getElementById("canvas");
    const statusText = document.getElementById("status");

    // Charger les modèles Face-api.js
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

    // Démarrer la webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { video.srcObject = stream; })
        .catch(err => console.error("Erreur d'accès à la webcam :", err));

    // Charger la photo de profil (URL stockée en base)
    const profileImage = await faceapi.fetchImage('/uploads/erdiwo.jpg');

    // Fonction pour capturer une image de la webcam
    captureBtn.addEventListener("click", async () => {
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            griserPage();
            // Afficher le chargement
            statusText.innerText = "✅ Vérification en cours. Veuillez patientez ...";

            // Capturer l'image sous forme de Blob
            const blob = await captureImageFromCanvas(canvas);
    
            // Convertir Blob en Image pour face-api.js
            const capturedImage = await faceapi.bufferToImage(blob);
    
            // Détecter les descripteurs
            const profileDescriptor = await getFaceDescriptor(profileImage);
            const capturedDescriptor = await getFaceDescriptor(capturedImage);
    
            if (!profileDescriptor || !capturedDescriptor) {
                statusText.innerText = "Erreur : Impossible de détecter un visage.";
                return;
            }
    
            // Comparer les descripteurs
            const distance = faceapi.euclideanDistance(profileDescriptor, capturedDescriptor);
            console.log("Distance entre les visages :", distance);
    
            if (distance < 0.6) {
                statusText.innerText = "✅ Identité confirmée, accès autorisé !";
                window.location.href = "/presence"; // Redirection
            } else {
                statusText.innerText = "❌ Échec : Visage non reconnu.";
            }
        } catch (error) {
            console.error("Erreur lors de la capture de l'image :", error);
            statusText.innerText = "⚠️ Erreur lors de la capture de l'image.";
        } finally {
            degriserPage();
        }
    });

    // Fonction pour obtenir le descripteur d'un visage
    async function getFaceDescriptor(image) {
        const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
        return detection ? detection.descriptor : null;
    }
});

// Fonction pour capturer une image depuis le canvas et la convertir en image
function captureImageFromCanvas(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Échec de la conversion du canvas en Blob"));
            }
        }, "image/png");
    });
}

function griserPage() {
    document.body.style.filter = "grayscale(100%)";  // Rend tout gris
    document.body.style.pointerEvents = "none";  // Empêche les clics
}

function degriserPage() {
    document.body.style.filter = "none";  // Enlève l'effet gris
    document.body.style.pointerEvents = "auto";  // Réactive les clics
}
