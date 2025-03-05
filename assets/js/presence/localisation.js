class GeoChecker {
    constructor() {
        this.zoneAnosy = [
            { lat: -18.916294109665827, lng: 47.515739942143895 },
            { lat: -18.914355561883927, lng: 47.51857169856484 },
            { lat: -18.917593228585034, lng: 47.521532051859666 },
            { lat: -18.92207917098206, lng: 47.51743327850374 }
        ];
    }

    checkLocation() {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur. Contactez votre supérieur.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            this.successCallback.bind(this),
            this.errorCallback.bind(this)
        );
    }

    async successCallback(position) {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        //console.log("Position détectée :", point);

        if (this.isPointInPolygonWinding(point, this.zoneAnosy)) {
            try {
                const faceRecognitionApp = new FaceRecognitionApp();
                await faceRecognitionApp.initialize();
            } catch (error) {
                console.error("Erreur lors de l'initialisation :", error);
            }
            console.log("L'utilisateur est bien dans la zone Anosy.");
        } else {
            alert("Impossible de pointer votre présence. Vous n'êtes pas au bureau.");
            window.location.href = '/presence';
            console.warn("L'utilisateur est hors zone :", point);
        }
    }

    errorCallback(error) {
        console.error("Erreur lors de la récupération de la position :", error);
        alert("Erreur lors de la récupération de la position. Vérifiez votre connexion internet.");
    }

    isPointInPolygonWinding(point, polygon) {
        let x = point.lng, y = point.lat;
        let windingNumber = 0;

        for (let i = 0; i < polygon.length; i++) {
            let j = (i + 1) % polygon.length;
            let xi = polygon[i].lng, yi = polygon[i].lat;
            let xj = polygon[j].lng, yj = polygon[j].lat;

            if (yi <= y) {
                if (yj > y && this.crossProduct(xi, yi, xj, yj, x, y) > 0) {
                    windingNumber += 1;
                }
            } else {
                if (yj <= y && this.crossProduct(xi, yi, xj, yj, x, y) < 0) {
                    windingNumber -= 1;
                }
            }
        }
        return windingNumber !== 0;
    }

    isPointInPolygon(point, polygon) {
        const x = point.lat;
        const y = point.long;
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lat;
            const yi = polygon[i].long;
            const xj = polygon[j].lat;
            const yj = polygon[j].long;
    
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi); 
        
            if(intersect) {
                inside = !inside;
            }
        }
        return inside
    }

    crossProduct(x1, y1, x2, y2, px, py) {
        return (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
    }
}

// Reconnaissance faciale
class FaceRecognitionApp {
    constructor() {
        this.faceApiService = new FaceApiService();
        this.webcamService = new WebcamService();
        this.uiService = new UIService();
    }

    async initialize() {
        await this.faceApiService.loadModels();
        await this.webcamService.startWebcam();

        const profileImage = await this.faceApiService.loadProfileImage();
        this.uiService.setupCaptureButton(profileImage, this.faceApiService, this.webcamService);
    }
}

class FaceApiService {
    constructor() {
        this.modelsPath = "/models";
    }

    async loadModels() {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(this.modelsPath),
            faceapi.nets.faceRecognitionNet.loadFromUri(this.modelsPath),
            faceapi.nets.faceLandmark68Net.loadFromUri(this.modelsPath)
        ]);
    }

    async loadProfileImage() {
        const profilPicture = document.getElementById("profilPicture").getAttribute("data-picture");
        return await faceapi.fetchImage(`/uploads/profil/${profilPicture}`);
    }

    async compareFaces(profileImage, capturedImage) {
        const profileDescriptor = await this.getFaceDescriptor(profileImage);
        const capturedDescriptor = await this.getFaceDescriptor(capturedImage);

        if (!profileDescriptor || !capturedDescriptor) {
            throw new Error("Impossible de détecter un visage.");
        }

        const distance = faceapi.euclideanDistance(profileDescriptor, capturedDescriptor);
        console.log("Distance entre les visages :", distance);
        return distance < 0.6; // Seuil de reconnaissance
    }

    async getFaceDescriptor(image) {
        const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
        return detection ? detection.descriptor : null;
    }
}

class WebcamService {
    async startWebcam() {
        try {
            const video = document.getElementById("video");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (error) {
            console.error("Erreur d'accès à la webcam :", error);
            throw error;
        }
    }

    async captureWebcamImage() {
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

    stopWebcam() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop()); // Arrêter chaque piste du flux
            this.stream = null;
        }
    }
}

class UIService {
    constructor() {
        this.captureBtn = document.getElementById("capture");
        this.statusText = document.getElementById("status");
        this.validationBtn = document.getElementById("validationBtn");
        this.videoBox = document.getElementById("videoBox");
    }

    setupCaptureButton(profileImage, faceApiService, webcamService) {
        this.captureBtn.addEventListener("click", async () => {
            try {
                this.griserPage();
                this.statusText.innerText = "✅ Vérification en cours. Veuillez patienter...";

                const capturedImage = await webcamService.captureWebcamImage();
                const match = await faceApiService.compareFaces(profileImage, capturedImage);

                if (match) {
                    this.statusText.innerText = "✅ Identité confirmée, accès autorisé !";
                    this.validationBtn.classList.remove("d-none");
                    this.videoBox.innerHTML = ""; // Masquer la vidéo après validation
                } else {
                    this.statusText.innerText = "❌ Échec : Visage non reconnu.";
                }
            } catch (error) {
                console.error("Erreur lors de la vérification :", error);
                this.statusText.innerText = "⚠️ Erreur lors de la capture de l'image.";
            } finally {
                this.degriserPage();
                webcamService.stopWebcam();
            }
        });
    }

    griserPage() {
        document.body.style.filter = "grayscale(100%)";
        document.body.style.pointerEvents = "none";
    }

    degriserPage() {
        document.body.style.filter = "none";
        document.body.style.pointerEvents = "auto";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const geoChecker = new GeoChecker();
    geoChecker.checkLocation();
});