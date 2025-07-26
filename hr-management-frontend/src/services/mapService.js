import L from 'leaflet';
import { toast } from 'sonner';

const amapaPolygon = [
  [-1.756109, -49.466701],
  [0.254114, -49.620509],
  [4.139668, -50.246730],
  [5.103310, -53.048244],
  [3.460017, -55.684962],
  [-0.745620, -55.333400],
  [-1.865917, -52.323146],
];

const initializeMap = (
  mapRef,
  mapInstanceRef,
  markers = [],
  center = null,
  onClick = null,
  draggable = false
) => {
  let attempts = 0;
  const maxAttempts = 3;
  const initializeWithRetry = () => {
    if (!mapRef.current || !mapRef.current.offsetWidth || !mapRef.current.offsetHeight) {
      attempts++;
      console.warn(`Tentativa ${attempts} falhou: Dimensões inválidas -`, {
        width: mapRef.current?.offsetWidth,
        height: mapRef.current?.offsetHeight,
      });
      if (attempts < maxAttempts) {
        setTimeout(initializeWithRetry, 300 * attempts);
        return;
      } else {
        console.error('Máximo de tentativas atingido para inicializar o mapa');
        toast.error('Erro: O mapa não pode ser carregado devido a dimensões inválidas.', {
          duration: 3000,
        });
        return;
      }
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Set a reasonable z-index for the map container
    mapRef.current.style.zIndex = '0';

    const map = L.map(mapRef.current, {
      center: center || [0.0349, -51.0694], // Macapá, Amapá
      zoom: center ? 13 : 8,
      scrollWheelZoom: false,
      zoomControl: true,
      dragging: true,
      minZoom: 6,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    try {
      L.polygon(amapaPolygon, {
        color: '#007bff',
        fillColor: '#007bff',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 10',
      }).addTo(map);
      if (!center) {
        map.fitBounds(L.latLngBounds(amapaPolygon));
      }
    } catch (error) {
      console.error('Error adding polygon:', error);
      toast.error('Erro ao carregar o mapa. Verifique a conexão.', { duration: 3000 });
    }

    const defaultIcon = L.divIcon({
      html: '<i class="fas fa-map-marker-alt" style="color: #007bff; font-size: 24px;"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
      className: 'custom-marker',
    });

    const hoverIcon = L.divIcon({
      html: '<i class="fas fa-map-marker-alt" style="color: #ff4500; font-size: 24px;"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
      className: 'custom-marker',
    });

    markers.forEach((markerData) => {
      if (markerData.lat && markerData.lng && !isNaN(markerData.lat) && !isNaN(markerData.lng)) {
        const latLng = [parseFloat(markerData.lat), parseFloat(markerData.lng)];
        if (isPointInPolygon(latLng, amapaPolygon)) {
          const marker = L.marker(latLng, { icon: defaultIcon, draggable }).addTo(map);
          marker.bindPopup(
            `<strong>${markerData.name || 'Apoiador sem nome'}</strong><br>Endereço: ${
              markerData.address || 'Não informado'
            }<br>CEP: ${markerData.cep || 'Não informado'}<br>Tipo de Suporte: ${
              markerData.supportType || 'Não informado'
            }`,
            { className: 'custom-popup', offset: [0, -10] }
          );
          if (draggable && onClick) {
            marker.on('dragend', () => {
              const position = marker.getLatLng();
              onClick({ lat: position.lat, lng: position.lng });
            });
          }
          marker.on('mouseover', () => {
            console.log('Mouseover no marcador:', markerData.name, latLng);
            marker.setIcon(hoverIcon);
          });
          marker.on('mouseout', () => {
            console.log('Mouseout no marcador:', markerData.name, latLng);
            marker.setIcon(defaultIcon);
          });
        }
      }
    });

    if (onClick) {
      let marker = null;
      map.on('click', (e) => {
        if (marker) map.removeLayer(marker);
        const { lat, lng } = e.latlng;
        if (isPointInPolygon([lat, lng], amapaPolygon)) {
          marker = L.marker([lat, lng], { icon: defaultIcon, draggable: true }).addTo(map);
          marker.on('dragend', () => {
            const position = marker.getLatLng();
            onClick({ lat: position.lat, lng: position.lng });
          });
          onClick({ lat, lng });
        } else {
          toast.error('A localização está fora da área de Amapá.', { duration: 3000 });
        }
      });
    }

    mapInstanceRef.current = map;
    map.invalidateSize(); // Immediate size adjustment
  };

  initializeWithRetry();
};

const initializeNewSupporterMap = (
  mapRef,
  mapInstanceRef,
  initialCoords = [0.0349, -51.0694],
  onClick = null
) => {
  let attempts = 0;
  const maxAttempts = 3;
  const initializeWithRetry = () => {
    if (!mapRef.current || !mapRef.current.offsetWidth || !mapRef.current.offsetHeight) {
      attempts++;
      console.warn(`Tentativa ${attempts} falhou: Dimensões inválidas -`, {
        width: mapRef.current?.offsetWidth,
        height: mapRef.current?.offsetHeight,
      });
      if (attempts < maxAttempts) {
        setTimeout(initializeWithRetry, 300 * attempts);
        return;
      } else {
        console.error('Máximo de tentativas atingido para inicializar o mapa de novo apoiador');
        toast.error('Erro: O mapa de novo apoiador não pode ser carregado devido a dimensões inválidas.', {
          duration: 3000,
        });
        return;
      }
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Set a reasonable z-index for the map container
    mapRef.current.style.zIndex = '0';

    const map = L.map(mapRef.current, {
      center: initialCoords,
      zoom: 13,
      scrollWheelZoom: true,
      zoomControl: true,
      dragging: true,
      minZoom: 6,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    try {
      L.polygon(amapaPolygon, {
        color: '#28a745',
        fillColor: '#28a745',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 10',
      }).addTo(map);
    } catch (error) {
      console.error('Error adding polygon:', error);
      toast.error('Erro ao carregar o mapa. Verifique a conexão.', { duration: 3000 });
    }

    const defaultIcon = L.divIcon({
      html: '<i class="fas fa-map-marker-alt" style="color: #28a745; font-size: 24px;"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
      className: 'custom-marker',
    });

    const hoverIcon = L.divIcon({
      html: '<i class="fas fa-map-marker-alt" style="color: #ff4500; font-size: 24px;"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
      className: 'custom-marker',
    });

    let marker = null;
    if (
      initialCoords[0] &&
      initialCoords[1] &&
      !isNaN(initialCoords[0]) &&
      !isNaN(initialCoords[1]) &&
      isPointInPolygon(initialCoords, amapaPolygon)
    ) {
      marker = L.marker(initialCoords, { icon: defaultIcon, draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        if (onClick) onClick({ lat: position.lat, lng: position.lng });
      });
      marker.on('mouseover', () => {
        console.log('Mouseover no marcador de novo apoiador:', initialCoords);
        marker.setIcon(hoverIcon);
      });
      marker.on('mouseout', () => {
        console.log('Mouseout no marcador de novo apoiador:', initialCoords);
        marker.setIcon(defaultIcon);
      });
    }

    if (onClick) {
      map.on('click', (e) => {
        if (marker) map.removeLayer(marker);
        const { lat, lng } = e.latlng;
        if (isPointInPolygon([lat, lng], amapaPolygon)) {
          marker = L.marker([lat, lng], { icon: defaultIcon, draggable: true }).addTo(map);
          marker.on('dragend', () => {
            const position = marker.getLatLng();
            onClick({ lat: position.lat, lng: position.lng });
          });
          marker.on('mouseover', () => {
            console.log('Mouseover no marcador de clique:', [lat, lng]);
            marker.setIcon(hoverIcon);
          });
          marker.on('mouseout', () => {
            console.log('Mouseout no marcador de clique:', [lat, lng]);
            marker.setIcon(defaultIcon);
          });
          onClick({ lat, lng });
        } else {
          toast.error('A localização está fora da área de Amapá.', { duration: 3000 });
        }
      });
    }

    mapInstanceRef.current = map;
    map.invalidateSize(); // Immediate size adjustment
  };

  initializeWithRetry();
};

const isPointInPolygon = (point, polygon) => {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export { initializeMap, initializeNewSupporterMap, isPointInPolygon };