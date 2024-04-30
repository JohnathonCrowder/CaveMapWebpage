document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    var caveMarkers = L.layerGroup().addTo(map);

    fetch('/caves')
        .then(response => response.json())
        .then(data => {
            data.forEach(cave => {
                L.marker([cave.latitude, cave.longitude]).bindPopup(cave.cave).addTo(caveMarkers);
            });
            map.fitBounds(caveMarkers.getBounds());
        });

    document.getElementById('filter_button').addEventListener('click', function() {
        var searchQuery = document.getElementById('search_query').value;
        var distance = document.getElementById('distance').value;
        var state = document.getElementById('state').value;
        var country = document.getElementById('country').value;

        var formData = new FormData();
        formData.append('search_query', searchQuery);
        formData.append('distance', distance);
        formData.append('state', state);
        formData.append('country', country);

        navigator.geolocation.getCurrentPosition(function(position) {
            formData.append('user_lat', position.coords.latitude);
            formData.append('user_lon', position.coords.longitude);

            fetch('/filter', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    caveMarkers.clearLayers();
                    data.forEach(cave => {
                        L.marker([cave.latitude, cave.longitude]).bindPopup(cave.cave).addTo(caveMarkers);
                    });
                    map.fitBounds(caveMarkers.getBounds());
                });
        });
    });

    document.getElementById('show_all_button').addEventListener('click', function() {
        fetch('/caves')
            .then(response => response.json())
            .then(data => {
                caveMarkers.clearLayers();
                data.forEach(cave => {
                    L.marker([cave.latitude, cave.longitude]).bindPopup(cave.cave).addTo(caveMarkers);
                });
                map.fitBounds(caveMarkers.getBounds());
            });
    });

    document.getElementById('user_location_button').addEventListener('click', function() {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLatLng = [position.coords.latitude, position.coords.longitude];
            L.marker(userLatLng).bindPopup('Your Location').addTo(map);
            map.setView(userLatLng, 8);
        });
    });

    fetch('/caves')
        .then(response => response.json())
        .then(data => {
            var states = [...new Set(data.map(cave => cave.region))].sort();
            var stateDropdown = document.getElementById('state');
            states.forEach(state => {
                var option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateDropdown.appendChild(option);
            });

            var countries = [...new Set(data.map(cave => cave.countryCode))].sort();
            var countryDropdown = document.getElementById('country');
            countries.forEach(country => {
                var option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countryDropdown.appendChild(option);
            });
        });
});