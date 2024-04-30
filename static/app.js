document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([0, 0], 2);
    var markers = L.layerGroup().addTo(map);
    var userMarker = null;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
    });

    var satelliteCheckbox = document.getElementById('satellite-checkbox');
    satelliteCheckbox.addEventListener('change', function() {
        if (this.checked) {
            map.removeLayer(L.tileLayer());
            map.addLayer(satelliteLayer);
        } else {
            map.removeLayer(satelliteLayer);
            map.addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                maxZoom: 18,
            }));
        }
    });

    fetch('/get_caves')
        .then(response => response.json())
        .then(data => {
            data.forEach(cave => {
                var marker = L.marker([cave.latitude, cave.longitude]).addTo(markers);
                marker.bindPopup(`<b>${cave.cave}</b><br>Latitude: ${cave.latitude}<br>Longitude: ${cave.longitude}`);
            });
            map.fitBounds(markers.getBounds());
        });

    var caveList = document.getElementById('cave-list');
    var showCaveButton = document.getElementById('show-cave-button');
    var userLocationButton = document.getElementById('user-location-button');
    var showAllButton = document.getElementById('show-all-button');

    caveList.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            var latitude = event.target.getAttribute('data-latitude');
            var longitude = event.target.getAttribute('data-longitude');
            map.setView([latitude, longitude], 10);
        }
    });

    showCaveButton.addEventListener('click', function() {
        var selectedCave = caveList.querySelector('.selected');
        if (selectedCave) {
            var latitude = selectedCave.getAttribute('data-latitude');
            var longitude = selectedCave.getAttribute('data-longitude');
            map.setView([latitude, longitude], 10);
        }
    });

    userLocationButton.addEventListener('click', function() {
        fetch('/get_user_location')
            .then(response => response.json())
            .then(data => {
                if (data.latitude && data.longitude) {
                    if (userMarker) {
                        map.removeLayer(userMarker);
                    }
                    userMarker = L.marker([data.latitude, data.longitude]).addTo(map);
                    userMarker.bindPopup('Your Location');
                    map.setView([data.latitude, data.longitude], 10);
                }
            });
    });

    showAllButton.addEventListener('click', function() {
        map.fitBounds(markers.getBounds());
    });

    // Add event listeners and filtering functionality for search input, distance input, state dropdown, and country dropdown
    // ...
});