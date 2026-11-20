import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { centrePays } from '@/lib/paysCarte';

export type MapPin = { id: string; name: string; lat: number; lng: number; week?: boolean };

type Props = {
  pins: MapPin[];
  activeId: string | null;
  onSelect: (id: string) => void;
  /**
   * Les pays d'une aire du monde, quand la carte d'un pays se relit à cette
   * échelle : la toile se cadre alors sur l'aire entière, et les régions du
   * pays apparaissent dans le voisinage qui donne son sens à son activité.
   * Vide, la carte se cadre sur ses propres épingles.
   */
  framePays?: string[];
};

export default function DirectoryMap({ pins, activeId, onSelect, framePays = [] }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const selectRef = useRef(onSelect);
  const frameRef = useRef(framePays);
  frameRef.current = framePays;
  const frameKey = framePays.join(',');

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, {
      center: [33.2, 2.6],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resize = window.setTimeout(() => map.invalidateSize(), 180);

    return () => {
      window.clearTimeout(resize);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();

    pins.forEach((pin) => {
      /* Registered this week: a larger pin with a double ring, so the freshest
         establishments read geographically and not only in the list. */
      const week = Boolean(pin.week);
      const size = week ? 26 : 22;
      const marker = L.marker([pin.lat, pin.lng], {
        title: pin.name,
        icon: L.divIcon({
          className: `map-pin${week ? ' is-week' : ''}`,
          html: '<span></span>',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
      });
      marker.on('click', () => selectRef.current(pin.id));
      marker.addTo(layer);
      markersRef.current.set(pin.id, marker);
    });

    /* Une aire lue passe avant les épingles : le pays se lit alors auprès de
       ses voisins, et non seul, cadré au plus près de ses seules adresses. */
    const area = frameRef.current;
    if (area.length > 0) {
      const centres = area.map((code) => centrePays(code)).map((c) => [c.lat, c.lng] as [number, number]);
      map.fitBounds(L.latLngBounds(centres), { padding: [34, 34], maxZoom: 6 });
      return;
    }
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [56, 56], maxZoom: pins.length <= 2 ? 9 : 6 });
    }
  }, [pins, frameKey]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (el) el.classList.toggle('is-active', id === activeId);
    });
  }, [activeId]);

  return <div ref={hostRef} className="dir-map" role="application" aria-label="Carte des ateliers référencés" />;
}