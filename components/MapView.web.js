import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// برای وب از Leaflet استفاده می‌کنیم
// توجه: CSS باید از CDN لود شود، نه اینجا!

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
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // بررسی اگر Leaflet قبلاً لود شده
      if (window.L) {
        initializeMap();
        return;
      }

      // اضافه کردن CSS Leaflet از CDN
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      // اضافه کردن JS Leaflet از CDN
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;

      script.onload = () => {
        // Fix برای آیکون‌های Leaflet
        if (window.L) {
          delete window.L.Icon.Default.prototype._getIconUrl;
          window.L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
        }
        initializeMap();
      };

      document.body.appendChild(script);
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current || mapInstanceRef.current) return;

      const lat = region?.latitude || initialRegion?.latitude || 35.6892;
      const lng = region?.longitude || initialRegion?.longitude || 51.3890;
      const zoom = 13;

      try {
        // ساخت نقشه
        const map = window.L.map(mapRef.current).setView([lat, lng], zoom);

        // اضافه کردن tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // اضافه کردن marker
        const marker = window.L.marker([lat, lng]).addTo(map);
        markerRef.current = marker;

        // Event listener برای تغییر موقعیت
        map.on('moveend', () => {
          const center = map.getCenter();
          if (onRegionChangeComplete) {
            onRegionChangeComplete({
              latitude: center.lat,
              longitude: center.lng,
            });
          }
          
          // آپدیت marker
          if (markerRef.current) {
            markerRef.current.setLatLng(center);
          }
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // آپدیت نقشه وقتی region تغییر می‌کند
  useEffect(() => {
    if (mapInstanceRef.current && region) {
      const { latitude, longitude } = region;
      mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom());
      
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
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
          overflow: 'hidden'
        }} 
      />
    </View>
  );
};

const Marker = ({ coordinate, title, description }) => {
  // Marker در web component اصلی handle می‌شود
  return null;
};

MapView.Marker = Marker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default MapView;
export { Marker };
