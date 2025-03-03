import axios from 'axios';

class MapApp {
    constructor() {
        this.zoomLevel = 16;
        this.maxZoom = 20;
        this.selectingHouse = false;
        this.houseMarker = null;
        this.workZone = [
            { lat: -18.91613679379899, lng: 47.517188787460334 },
            { lat: -18.915616635443502, lng: 47.51775205135346 },
            { lat: -18.916999491894025, lng: 47.51897513866425 },
            { lat: -18.917470167948377, lng: 47.51834616065027 }
        ];
        
        this.initElements();
        this.initMap();
        this.displayUserLocation();
        this.addWorkZonePolygon();
        this.setupEventListeners();
        this.fetchHouses();
        this.addFixedMarkers();
    }

    initElements() {
        this.mapContainer = document.getElementById('map');
        this.selectButton = document.getElementById('select-house');
        this.cancelButton = document.getElementById('cancel-selection');
        this.coordText = document.getElementById('coord-text');
    }

    initMap() {
        this.map = L.map('map').setView([-18.9168911, 47.5185188], this.zoomLevel);

        this.tileLayers = {
            "Google Maps": L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=TA_CLE_API', { maxZoom: this.maxZoom, attribution: '&copy; Google Maps' }),
            "Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=TA_CLE_API', { maxZoom: this.maxZoom, attribution: '&copy; Google Maps' }),
            "Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=TA_CLE_API', { maxZoom: this.maxZoom, attribution: '&copy; Google Maps' }),
            "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: this.maxZoom, attribution: '&copy; OpenStreetMap contributors' })
        };

        this.tileLayers["Satellite"].addTo(this.map);
        L.control.layers(this.tileLayers).addTo(this.map);

    }
         
    // Nouvelle méthode pour ajouter le polygone de la zone de travail
    addWorkZonePolygon() {
        const polygon = L.polygon(this.workZone, {
            color: 'blue',       // Couleur de la bordure
            fillColor: 'green',  // Couleur de remplissage
            fillOpacity: 0.2     // Opacité du remplissage
        }).addTo(this.map);

        // Ajouter une popup au polygone
        polygon.bindPopup('Zone de travail');
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeMap());
        this.resizeMap();
        
        this.map.on('mousemove', (event) => this.updateCoordinates(event));
        this.map.on('click', (event) => this.handleMapClick(event));
        
        this.selectButton.addEventListener('click', () => this.toggleHouseSelection(true));
        this.cancelButton.addEventListener('click', () => this.toggleHouseSelection(false));
    }

    resizeMap() {
        this.mapContainer.style.height = window.innerHeight + "px";
    }

    updateCoordinates(event) {
        const { lat, lng } = event.latlng;
        this.coordText.textContent = `Lat: ${lat.toFixed(7)}, Long: ${lng.toFixed(7)}`;
    }

    handleMapClick(event) {
        if (this.selectingHouse) {
            this.addHouse(event.latlng);
        } else {
            this.showPopup(event.latlng);
        }
    }

    showPopup({ lat, lng }) {
        L.popup().setLatLng([lat, lng])
            .setContent(`Coordonnées :<br><b>Latitude:</b> ${lat}<br><b>Longitude:</b> ${lng}`)
            .openOn(this.map);
    }

    fetchHouses() {
        axios.get('/get/house')
            .then(response => {
                response.data.houses.forEach(house => {
                    L.marker([house.latitude, house.longitude])
                        .addTo(this.map)
                        .bindPopup(`Résidence de <b>${house.user}</b>`);
                });
            })
            .catch(error => console.error('Erreur chargement habitations', error));
    }

    addFixedMarkers() {
        const markersData = [
            { lat: -18.913790, lng: 47.532443, title: "Erdiwo Home" },
            { lat: -18.916793, lng: 47.518336, title: "SPLOF Anosy, Madagascar" }
        ];
        
        markersData.forEach(data => {
            L.marker([data.lat, data.lng])
                .addTo(this.map)
                .bindPopup(`<b>${data.title}</b>`)
                .openPopup();
        });
    }

    toggleHouseSelection(enable) {
        this.selectingHouse = enable;
        this.map._container.style.cursor = enable ? 'crosshair' : 'grab';
        this.selectButton.classList.toggle('d-none', enable);
        this.cancelButton.classList.toggle('d-none', !enable);
    }

    addHouse({ lat, lng }) {
        if (this.houseMarker) this.map.removeLayer(this.houseMarker);
        this.houseMarker = L.marker([lat, lng]).addTo(this.map).bindPopup("Votre maison").openPopup();
        
        axios.post('/add/house', { latitude: lat, longitude: lng })
            .then(() => alert('Maison ajoutée avec succès !'))
            .catch(error => console.error('Erreur ajout maison', error));
        
        this.toggleHouseSelection(false);
    }

    displayUserLocation() {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                L.marker([latitude, longitude])
                    .addTo(this.map)
                    .bindPopup("📍 Vous êtes ici 📍")
                    .openPopup();
                
                this.map.setView([latitude, longitude], 18);
            },
            (error) => {
                alert("Impossible de récupérer votre position.");
                console.error(error);
            }
        );
    }
}

// Initialisation de l'application
document.addEventListener("DOMContentLoaded", () => new MapApp());