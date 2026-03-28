let mapInstance = null;

export async function showHospitalMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear previous content (if any)
    container.innerHTML = '';
    
    // Create a div for the map
    const mapDiv = document.createElement('div');
    mapDiv.style.height = '400px';
    mapDiv.style.width = '100%';
    mapDiv.id = 'hospital-map';
    container.appendChild(mapDiv);
    
    // Center on Bihar (Patna)
    const center = [25.5941, 85.1376];
    
    // Initialize map
    mapInstance = L.map(mapDiv).setView(center, 8);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);
    
    // Load mock hospitals (for now)
    loadMockHospitals();
}

function loadMockHospitals() {
    const hospitals = [
        { name: "Darbhanga Medical College", lat: 26.1542, lng: 85.8915, address: "Darbhanga, Bihar" },
        { name: "Patna Medical College", lat: 25.5941, lng: 85.1376, address: "Patna, Bihar" },
        { name: "Muzaffarpur Sadar Hospital", lat: 26.1199, lng: 85.3905, address: "Muzaffarpur, Bihar" },
        { name: "Gaya Medical College", lat: 24.7964, lng: 85.0074, address: "Gaya, Bihar" },
        { name: "Bhagalpur Medical College", lat: 25.2425, lng: 86.9874, address: "Bhagalpur, Bihar" }
    ];
    
    hospitals.forEach(hospital => {
        L.marker([hospital.lat, hospital.lng])
            .addTo(mapInstance)
            .bindPopup(`<strong>${hospital.name}</strong><br>${hospital.address}`);
    });
    
    // Auto-fit map to show all markers
    if (hospitals.length > 0) {
        const bounds = hospitals.map(h => [h.lat, h.lng]);
        mapInstance.fitBounds(bounds);
    }
}