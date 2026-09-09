const GEOCODE_URL = "https://nominatim.openstreetmap.org/search";
const ROUTE_URL = "https://router.project-osrm.org/route/v1/driving";

export async function calculateMovementQuote({ originAddress, destinationAddress, zones }) {
    const [origin, destination] = await Promise.all([
        geocode(originAddress),
        geocode(destinationAddress)
    ]);
    if (!origin || !destination) {
        return null;
    }

    const route = await fetchRoute(origin, destination);
    const distanceKm = round(route?.distanceKm || haversineDistance(origin, destination));
    const zone = zones.find((item) => distanceKm >= Number(item.min) && distanceKm <= Number(item.max));
    if (!zone) {
        return { distanceKm, travelMinutes: route?.travelMinutes || null, zone: null, surcharge: 0 };
    }
    return {
        distanceKm,
        travelMinutes: route?.travelMinutes || null,
        zone: { min: Number(zone.min), max: Number(zone.max) },
        surcharge: Number(zone.fee) || 0
    };
}

async function geocode(address) {
    try {
        const response = await fetch(`${GEOCODE_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`);
        const results = await response.json();
        if (!results[0]) return null;
        return { latitude: Number(results[0].lat), longitude: Number(results[0].lon) };
    } catch {
        return null;
    }
}

async function fetchRoute(origin, destination) {
    try {
        const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
        const response = await fetch(`${ROUTE_URL}/${coordinates}?overview=false`);
        const data = await response.json();
        const route = data.routes?.[0];
        if (!route) return null;
        return { distanceKm: route.distance / 1000, travelMinutes: Math.round(route.duration / 60) };
    } catch {
        return null;
    }
}

function haversineDistance(origin, destination) {
    const radians = Math.PI / 180;
    const latitudeDelta = (destination.latitude - origin.latitude) * radians;
    const longitudeDelta = (destination.longitude - origin.longitude) * radians;
    const latitudeA = origin.latitude * radians;
    const latitudeB = destination.latitude * radians;
    const value = Math.sin(latitudeDelta / 2) ** 2
        + Math.sin(longitudeDelta / 2) ** 2 * Math.cos(latitudeA) * Math.cos(latitudeB);
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function round(value) {
    return Math.round(value * 10) / 10;
}