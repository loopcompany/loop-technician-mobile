import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

const NESHAN_SDK_JS_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js';
const NESHAN_SDK_CSS_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css';

// بهتره از env بگیری
const NESHAN_API_KEY = 'web.a7d38181a0094e0092a578bcc81b7641';

const MapView = ({
  initialRegion,
  region,
  onRegionChangeComplete,
  children,
  style,
  ...props
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const initializedRef = useRef(false);

  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadNeshanLeaflet = () => {
      return new Promise((resolve, reject) => {
        if (window.L) {
          resolve();
          return;
        }

        const existingCss = document.getElementById('neshan-leaflet-css');
        if (!existingCss) {
          const cssLink = document.createElement('link');
          cssLink.id = 'neshan-leaflet-css';
          cssLink.rel = 'stylesheet';
          cssLink.href = NESHAN_SDK_CSS_URL;
          cssLink.type = 'text/css';
          document.head.appendChild(cssLink);
        }

        const existingScript = document.getElementById('neshan-leaflet-js');

        if (existingScript) {
          existingScript.addEventListener('load', resolve);
          existingScript.addEventListener('error', reject);
          return;
        }

        const script = document.createElement('script');
        script.id = 'neshan-leaflet-js';
        script.src = NESHAN_SDK_JS_URL;
        script.type = 'text/javascript';
        script.async = true;

        script.onload = () => {
          resolve();
        };

        script.onerror = () => {
          reject(new Error('Failed to load Neshan Leaflet SDK'));
        };

        document.body.appendChild(script);
      });
    };

    const initializeMap = async () => {
      if (initializedRef.current) return;
      if (!mapRef.current) return;

      try {
        await loadNeshanLeaflet();

        if (!window.L || !mapRef.current || initializedRef.current) return;

        const lat =
          region?.latitude ||
          initialRegion?.latitude ||
          35.6892;

        const lng =
          region?.longitude ||
          initialRegion?.longitude ||
          51.3890;

        const zoom =
          region?.zoom ||
          initialRegion?.zoom ||
          14;

        initializedRef.current = true;

        /**
         * ساخت نقشه نشان
         * نکته مهم:
         * اینجا دیگر tileLayer مربوط به OpenStreetMap اضافه نمی‌شود.
         */
        const map = new window.L.Map(mapRef.current, {
          key: NESHAN_API_KEY,
          maptype: 'dreamy',
          poi: true,
          traffic: false,
          center: [lat, lng],
          zoom,
        });

        mapInstanceRef.current = map;

        const marker = window.L.marker([lat, lng]).addTo(map);
        markerRef.current = marker;

        map.on('moveend', () => {
          const center = map.getCenter();

          if (markerRef.current) {
            markerRef.current.setLatLng(center);
          }

          if (onRegionChangeComplete) {
            onRegionChangeComplete({
              latitude: center.lat,
              longitude: center.lng,
            });
          }
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 300);

        setIsMapReady(true);
      } catch (error) {
        console.log('Error initializing Neshan map:', error);
        initializedRef.current = false;
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !region) return;

    const { latitude, longitude } = region;

    if (!latitude || !longitude) return;

    mapInstanceRef.current.setView(
      [latitude, longitude],
      mapInstanceRef.current.getZoom()
    );

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [region]);

  return (
    <View style={[styles.container, style]}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      />

      {!isMapReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f3f3',
            color: '#555',
            fontSize: 14,
            zIndex: 10,
          }}
        >
          Loading Neshan Map...
        </div>
      )}
    </View>
  );
};

const Marker = ({ coordinate, title, description }) => {
  return null;
};

MapView.Marker = Marker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
});

export default MapView;
export { Marker };
