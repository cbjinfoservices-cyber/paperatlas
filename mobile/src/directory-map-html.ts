type Point = { name: string; lat?: number; lng?: number };

export function mapLocations(points: readonly Point[]) {
  const locations = new Map<string, { lat: number; lng: number; names: string[] }>();
  for (const { name, lat, lng } of points) {
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 85.0511 || Math.abs(lng) > 180) continue;
    const key = `${lat},${lng}`;
    const location = locations.get(key);
    if (location) location.names.push(name);
    else locations.set(key, { lat, lng, names: [name] });
  }
  return [...locations.values()];
}

export function directoryMapHtml(locations: ReturnType<typeof mapLocations>) {
  const data = JSON.stringify(locations).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline' https://cdn.jsdelivr.net; img-src https://tile.openstreetmap.org data:">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"
 integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous">
<style>
html,body,#map{height:100%;margin:0} #map{background:#332d29}
#status{position:absolute;z-index:1000;bottom:0;left:0;right:0;margin:0;padding:8px 12px;background:#1c1a18;color:#f5ece1;font:14px sans-serif}
.leaflet-popup-content p{margin:4px 0}
</style></head>
<body><div id="map" aria-label="Carte des résultats"></div>
<p id="status" role="status">Chargement de la carte…</p>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"
 integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="anonymous"></script>
<script>
(() => {
const status = document.getElementById('status');
if (!window.L) {
  status.textContent = 'Carte indisponible. Vérifiez votre connexion ou utilisez la liste.';
} else {
  const locations = ${data};
  const map = L.map('map', { attributionControl: false, maxZoom: 18 });
  const bounds = L.latLngBounds(locations.map(({lat, lng}) => [lat, lng]));
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: locations.length === 1 ? 8 : 7 });
  } else {
    map.setView([33.2, 2.6], 4);
  }
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
  tiles.on('tileload', () => { status.hidden = true; });
  tiles.on('tileerror', () => {
    if (!status.hidden) status.textContent = 'Fond de carte indisponible. Les repères restent visibles.';
  });
  tiles.addTo(map);
  for (const {lat, lng, names} of locations) {
    const popup = document.createElement('div');
    for (const name of names) {
      const text = document.createElement('p');
      text.textContent = name;
      popup.appendChild(text);
    }
    L.circleMarker([lat, lng], {
      radius: names.length > 1 ? 12 : 9, color: '#1c1a18', weight: 2,
      fillColor: '#ef8b34', fillOpacity: 1
    }).bindPopup(popup).addTo(map);
  }
}
})();
</script></body></html>`;
}
