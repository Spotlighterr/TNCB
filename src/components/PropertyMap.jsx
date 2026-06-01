import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function PropertyMap({ lat, lng, address, title }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 16,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom accent-colored marker
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: var(--color-accent, #059669);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: #fff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34],
    });

    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: var(--font-display); padding: 4px 0;">
          <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${title || 'Vị trí phòng trọ'}</strong>
          <span style="font-size: 12px; color: #64748b;">${address}</span>
        </div>`,
        { maxWidth: 250 }
      )
      .openPopup();

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, address, title]);

  return (
    <div className="property-map-wrapper" id="property-map">
      <div
        ref={mapRef}
        style={{
          height: '350px',
          borderRadius: 'var(--radius-main)',
          overflow: 'hidden',
        }}
      />
      <style>{`
        .property-map-wrapper {
          border-radius: var(--radius-main);
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .custom-map-marker {
          background: none !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: var(--radius-subtle) !important;
          box-shadow: var(--shadow-md) !important;
        }

        .leaflet-popup-tip {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
