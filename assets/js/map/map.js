import axios from 'axios';

document.addEventListener("DOMContentLoaded", function() {
    const zoomLevel = 16;
    const maxZoom = 20;
    let selectingHouse = false;
    let houseMarker = null;

    const mapContainer = document.getElementById('map');
    const selectButton = document.getElementById('select-house');
    const cancelButton = document.getElementById('cancel-selection');
    const coordText = document.getElementById('coord-text');

    // Ajuster la hauteur de la carte
    function resizeMap() {
        mapContainer.style.height = window.innerHeight + "px";
    }
    window.addEventListener('resize', resizeMap);
    resizeMap();

    // Initialiser la carte
    const map = L.map('map').setView([-18.9168911, 47.5185188], zoomLevel);

    // Définir les fonds de carte
    const tileLayers = {
        "Google Maps": L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=TA_CLE_API', { maxZoom, attribution: '&copy; Google Maps' }),
        "Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=TA_CLE_API', { maxZoom, attribution: '&copy; Google Maps' }),
        "Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=TA_CLE_API', { maxZoom, attribution: '&copy; Google Maps' }),
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom, attribution: '&copy; OpenStreetMap contributors' })
    };
    tileLayers["Google Maps"].addTo(map);
    L.control.layers(tileLayers).addTo(map);

    // Récupérer et afficher les maisons
    function fetchHouses() {
        axios.get('/get/house')
            .then(response => {
                response.data.houses.forEach(house => {
                    L.marker([house.latitude, house.longitude])
                        .addTo(map)
                        .bindPopup(`Résidence de <b>${house.user}</b>`);
                });
            })
            .catch(error => console.error('Erreur chargement habitations', error));
    }
    fetchHouses();

    // Ajouter des marqueurs fixes
    const markersData = [
        { lat: -18.913790, lng: 47.532443, title: "Erdiwo Home" },
        { lat: -18.916793, lng: 47.518336, title: "SPLOF Anosy, Madagascar" }
    ];
    markersData.forEach(data => {
        L.marker([data.lat, data.lng])
            .addTo(map)
            .bindPopup(`<b>${data.title}</b>`)
            .openPopup();
    });

    // Mettre à jour les coordonnées au survol
    map.on('mousemove', (event) => {
        const { lat, lng } = event.latlng;
        coordText.textContent = `Lat: ${lat.toFixed(7)}, Long: ${lng.toFixed(7)}`;
    });

    // Afficher un popup au clic sur la carte
    map.on('click', (event) => {
        const { lat, lng } = event.latlng;
        L.popup().setLatLng(event.latlng)
            .setContent(`Coordonnées :<br><b>Latitude:</b> ${lat}<br><b>Longitude:</b> ${lng}`)
            .openOn(map);
    });

    // Activer/Désactiver le mode sélection de maison
    selectButton.addEventListener('click', () => toggleHouseSelection(true));
    cancelButton.addEventListener('click', () => toggleHouseSelection(false));

    function toggleHouseSelection(enable) {
        selectingHouse = enable;
        map._container.style.cursor = enable ? 'crosshair' : 'grab';
        selectButton.classList.toggle('d-none', enable);
        cancelButton.classList.toggle('d-none', !enable);
    }

    // Ajouter une maison au clic
    map.on('click', (e) => {
        if (!selectingHouse) return;
        const { lat, lng } = e.latlng;

        if (houseMarker) map.removeLayer(houseMarker);
        houseMarker = L.marker([lat, lng]).addTo(map).bindPopup("Votre maison").openPopup();

        axios.post('/add/house', { latitude: lat, longitude: lng })
            .then(() => alert('Maison ajoutée avec succès !'))
            .catch(error => console.error('Erreur ajout maison', error));

        toggleHouseSelection(false);
    });
});