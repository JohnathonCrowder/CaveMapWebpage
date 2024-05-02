document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([0, 0], 2);
    var markers = L.markerClusterGroup();
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

    function loadCaves() {
        fetch('/get_caves')
            .then(response => response.json())
            .then(data => {
                markers.clearLayers(); // Clear existing markers
                data.forEach(cave => {
                    var marker = L.marker([cave.latitude, cave.longitude]);
                    marker.bindPopup(`<b>${cave.cave}</b><br>Latitude: ${cave.latitude}<br>Longitude: ${cave.longitude}`);
                    markers.addLayer(marker);
                });
                map.addLayer(markers);
            });
    }

    loadCaves(); // Load caves initially

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
                    loadCaves(); // Load caves after showing user location
                }
            });
    });

    showAllButton.addEventListener('click', function() {
        loadCaves(); // Reload caves
        map.fitBounds(markers.getBounds()); // Fit map bounds to markers
    });

    // Load regions dropdown
// Load regions dropdown
function loadRegions() {
    fetch('/get_regions')
        .then(response => response.json())
        .then(data => {
            var regionDropdown = document.getElementById('region-dropdown');
            data.forEach(region => {
                var option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionDropdown.appendChild(option);
            });
        });
}

loadRegions(); // Load regions initially

// Update loadCaves function to include region filtering and zooming
function loadCaves() {
    var region = document.getElementById('region-dropdown').value;
    var url = '/get_caves';
    if (region) {
        url += '?region=' + encodeURIComponent(region);
    }
    fetch(url)
        .then(response => response.json())
        .then(data => {
            markers.clearLayers(); // Clear existing markers
            var bounds = L.latLngBounds();
            data.forEach(cave => {
                var marker = L.marker([cave.latitude, cave.longitude]);
                marker.bindPopup(`<b>${cave.cave}</b><br>Latitude: ${cave.latitude}<br>Longitude: ${cave.longitude}<br>Region: ${cave.region}`);
                markers.addLayer(marker);
                bounds.extend(marker.getLatLng());
            });
            map.addLayer(markers);

            if (region) {
                // Zoom in on the selected region
                map.fitBounds(bounds);
            } else {
                // Show the default map
                map.setView([0, 0], 2);
            }
        });
}

// Add event listener for region dropdown
var regionDropdown = document.getElementById('region-dropdown');
regionDropdown.addEventListener('change', function() {
    loadCaves(); // Reload caves when region is selected
});
});