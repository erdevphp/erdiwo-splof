function checkLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Coordonnée de la position actuelle de l'internaute
                //const point = {lat: position.coords.latitude, long: position.coords.longitude};

                // Coordonnée de test qui est à l'intérieur de Anosy
                const point = {lat:-18.916793, long:47.518336}

                // Coordonnée lieu de Travail Anosy
                const zoneAnosy = [
                    {lat:-18.916857, long:47.518023}, // First point
                    {lat:-18.916492, long:47.518528}, // First point
                    {lat:-18.916776, long:47.518781}, // First point
                    {lat:-18.917174, long:47.518280} // First point
                ];
                const isInZone = isPointInPolygon(point, zoneAnosy);
                // Vérification si l'utilisateur est dans la zone
                if (isInZone) {
                    fetch('/presence/new/pointage', {
                        method : 'POST', 
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(point)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        
                        if (data.status !== 'success') {
                            alert("Vous êtes hors de la zone de travail!");
                            window.location.href = '/';
                        } else {
                            console.log('coucou');
                            
                        }
                    })
                    .catch(error => {
                        console.error('Erreur de vérification', error);
                        window.location.href = '/';
                    })
                } else {                    
                    alert("Impossible de pointer votre présence. Vous n'êtes pas au bureau.");
                    window.location.href = '/';
                }
            },
            (error) => {
                alert("Erreur lors de la récupération de la position. Vérifiez votre connexion internet");
                window.location.href = '/';
            }
        );
    } else {
        alert("La géolocalisation n'est pas supporté par votre navigateur. Contactez votre supérieur.");
        window.location.href = '/';
    }
    
}

function isPointInPolygon(point, polygon) {
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

function isPointInPolygonWinding(point, polygon) {
    let x = point.long, y = point.lat;
    let windingNumber = 0;
    for (let i = 0; i < polygon.length; i++) {
        let j = (i + 1) % polygon.length; // prochain sommet de fermeture du polygone
        let xi = polygon[i].long, yi = polygon[i].lat;
        let xj = polygon[i].long, yj = polygon[j].lat;

        if (yi <= y) {
            if(yj > y && crossProduct(xi, yi, xj, yj, x, y) > 0) {
                windingNumber += 1;
            }
        } else {
            if (yj <= y && crossProduct(xi, yi, xj, yj, x, y) < 0) {
                windingNumber -= 1;
            }
        }
    }
    return windingNumber !== 0
}
function crossProduct(x1, y1, x2, y2, px, py) {
    return (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
}

document.addEventListener("DOMContentLoaded", checkLocation());
/*
Zone de test
const point = {lat:-18.56, long:47.59}
const zone = [
    {lat:-18.55, long:47.58}, // First point
    {lat:-18.57, long:47.58}, // First point
    {lat:-18.57, long:47.60}, // First point
    {lat:-18.55, long:47.60} // First point
];
*/


