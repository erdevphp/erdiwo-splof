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

    successCallback(position) {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        console.log("Position détectée :", point);

        if (this.isPointInPolygonWinding(point, this.zoneAnosy)) {
            console.log("L'utilisateur est bien dans la zone Anosy.");
        } else {
            alert("Impossible de pointer votre présence. Vous n'êtes pas au bureau.");
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

document.addEventListener("DOMContentLoaded", () => {
    const geoChecker = new GeoChecker();
    geoChecker.checkLocation();
});