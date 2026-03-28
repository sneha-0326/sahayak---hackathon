let mapInstance = null;

export async function showHospitalMap(containerId, district = '', city = '', state = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">Loading map...</p>';

    // Build location string from woman's profile
    const locationQuery = [city, district, state, 'India'].filter(Boolean).join(', ');

    try {
        // Step 1: Geocode the woman's location to get coordinates
        const coords = await geocodeLocation(district, city, state);

        container.innerHTML = '';
        const mapDiv = document.createElement('div');
        mapDiv.style.height = '400px';
        mapDiv.style.width = '100%';
        mapDiv.id = 'hospital-map';
        container.appendChild(mapDiv);

        mapInstance = L.map(mapDiv).setView([coords.lat, coords.lon], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Add "woman's location" pin
        L.marker([coords.lat, coords.lon], {
            icon: L.divIcon({ className: '', html: '📍', iconSize: [30, 30] })
        }).addTo(mapInstance).bindPopup(`<strong>Patient Location</strong><br>${locationQuery}`, {closeButton: false}).openPopup();

        // Step 2: Find nearby hospitals using Overpass API
        await loadNearbyHospitals(coords.lat, coords.lon, district, state);

    } catch (err) {
        console.error('Map error:', err);
        // Fallback — show default Bihar map with mock hospitals
        container.innerHTML = '';
        const mapDiv = document.createElement('div');
        mapDiv.style.height = '400px';
        mapDiv.style.width = '100%';
        mapDiv.id = 'hospital-map';
        container.appendChild(mapDiv);

        mapInstance = L.map(mapDiv).setView([25.5941, 85.1376], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);
        loadMockHospitals();
    }
}

async function geocodeLocation(district = '', city = '', state = '') {
    // Try progressively broader queries until one works
    const queries = [
        [city, district, state, 'India'].filter(Boolean).join(', '),
        [district, state, 'India'].filter(Boolean).join(', '),
        [city, state, 'India'].filter(Boolean).join(', '),
        [state, 'India'].filter(Boolean).join(', ')
    ].filter(q => q.trim() !== 'India' && q.trim() !== '');

    for (const query of queries) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            const data = await res.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
        } catch (e) { continue; }
    }
    throw new Error('Location not found');
}

async function loadNearbyHospitals(lat, lon, district = '', state = '') {
    // Try 20km first, then 50km if nothing found
    const radii = [20000, 50000, 100000];

    for (const radius of radii) {
        const query = `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:${radius},${lat},${lon});
              way["amenity"="hospital"](around:${radius},${lat},${lon});
            );
            out center 15;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.elements && data.elements.length > 0) {
                data.elements.forEach(el => {
                    const elLat = el.lat || el.center?.lat;
                    const elLon = el.lon || el.center?.lon;
                    const name = el.tags?.name || 'Hospital';
                    if (elLat && elLon) {
                        L.marker([elLat, elLon])
                            .addTo(mapInstance)
                            .bindPopup(`<strong>🏥 ${name}</strong>`, {closeButton: false});
                    }
                });
                return; // found hospitals, stop searching
            }
        } catch (e) { continue; }
    }

    // Nothing found even at 100km — show mock
    loadMockHospitals();
}

function loadMockHospitals() {
    const hospitals = [
        { name: "Patna Medical College Hospital", latitude: 25.6093, longitude: 85.1376, location: "Patna, Bihar" },
        { name: "Darbhanga Medical College", latitude: 26.1542, longitude: 85.8915, location: "Darbhanga, Bihar" },
        { name: "SKMCH Muzaffarpur", latitude: 26.1209, longitude: 85.3647, location: "Muzaffarpur, Bihar" },
        { name: "Gaya Medical College", latitude: 24.7964, longitude: 85.0074, location: "Gaya, Bihar" },
        { name: "Bhagalpur Medical College", latitude: 25.2425, longitude: 86.9874, location: "Bhagalpur, Bihar" }
    ];

    hospitals.forEach(h => {
        L.marker([h.latitude, h.longitude])
            .addTo(mapInstance)
            .bindPopup(`<strong>🏥 ${h.name}</strong><br>${h.location}`);
    });

    if (hospitals.length > 0) {
        mapInstance.fitBounds(hospitals.map(h => [h.latitude, h.longitude]));
    }
}
