document.addEventListener("DOMContentLoaded", function() {
    const zoomLevel = 16;
    const maxZoom = 20
    // Fonction pour ajuster la hauteur de la carte
    function resizeMap() {
        document.getElementById('map').style.height = window.innerHeight + "px";
    }

    // Exécuter au chargement et quand la fenêtre est redimensionnée
    resizeMap();
    window.addEventListener('resize', resizeMap);

    // Initialiser la carte avec une vue sur Madagascar
    var map = L.map('map').setView([-18.9168911, 47.5185188], zoomLevel); 

    // Définir les différents fonds de carte
    var googleMaps = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=TA_CLE_API', {
        maxZoom: maxZoom,
        attribution: '&copy; Google Maps'
    });

    var googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=TA_CLE_API', {
        maxZoom: maxZoom,
        attribution: '&copy; Google Maps'
    });

    var googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=TA_CLE_API', {
        maxZoom: maxZoom,
        attribution: '&copy; Google Maps'
    });

    var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: maxZoom,
        attribution: '&copy; OpenStreetMap contributors'
    });

    // Ajouter Google Maps par défaut
    googleMaps.addTo(map);

    // Ajouter le sélecteur de fonds de carte
    var baseMaps = {
        "Google Maps": googleMaps,
        "Satellite": googleSatellite,
        "Hybrid": googleHybrid,
        "OpenStreetMap": openStreetMap
    };

    L.control.layers(baseMaps).addTo(map);

    var erdiwoIcon = L.icon({
        iconUrl: '/uploads/profil/anjaratianaerdieflaviau.jpg',
        iconSize:     [50, 50], // size of the icon
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    // Tableau des coordonnées des marqueurs
    const markersData = [
        { lat: -18.913790, lng: 47.532443, title: "Erdiwo Home" },
        { lat: -18.916793, lng: 47.518336, title: "SPLOF Anosy, Madagascar" },
    ];

    // Ajout des marqueurs à la carte
    markersData.forEach(data => {
        L.marker([data.lat, data.lng])
            .addTo(map)
            .bindPopup(`<b>${data.title}</b>`)
            .openPopup();
    });

    // Sélectionner l'élément HTML pour afficher les coordonnées
    var coordText = document.getElementById('coord-text');

    // Mettre à jour les coordonnées en fonction du mouvement de la souris
    map.on('mousemove', function(event) {
        var lat = event.latlng.lat.toFixed(6);
        var lng = event.latlng.lng.toFixed(6);
        coordText.textContent = `Lat: ${lat}, Long: ${lng}`;
    });

    // Afficher un popup avec les coordonnées lorsqu'on clique sur la carte
    map.on('click', function(event) {
        var lat = event.latlng.lat.toFixed(6);
        var lng = event.latlng.lng.toFixed(6);
        L.popup()
            .setLatLng(event.latlng)
            .setContent(`Coordonnées :<br><b>Lat:</b> ${lat}<br><b>Lng:</b> ${lng}`)
            .openOn(map);
    });

});