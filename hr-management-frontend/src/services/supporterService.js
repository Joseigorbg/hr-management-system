import { api } from '../contexts/AuthContext';
import L from 'leaflet';

const mockAddresses = [
  'Rua das Flores, 123, Macapá, AP',
  'Avenida Beira Rio, 456, Macapá, AP',
  'Travessa São José, 789, Macapá, AP',
];

const amapaPolygon = [
  [-1.756109, -49.466701],
  [0.254114, -49.620509],
  [4.139668, -50.246730],
  [5.103310, -53.048244],
  [3.460017, -55.684962],
  [-0.745620, -55.333400],
  [-1.865917, -52.323146],
];

const processError = (error, defaultMessage) => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  return new Error(message);
};

const supporterService = {
  validateSupporter(apoiador) {
    if (!apoiador?.name) return 'Nome é obrigatório';
    if (!apoiador?.phone) return 'Telefone é obrigatório';
    if (!apoiador?.address) return 'Endereço é obrigatório';
    if (!apoiador?.cep) return 'CEP é obrigatório';
    if (!apoiador?.mapping) return 'Mapeamento é obrigatório';
    if (!apoiador?.supportType) return 'Tipo de suporte é obrigatório';
    if (!apoiador?.lat || !apoiador?.lng) return 'Localização no mapa é obrigatória';
    return null;
  },

  getAddressSuggestions(value) {
    return value ? mockAddresses.filter((addr) => addr.toLowerCase().includes(value.toLowerCase())) : [];
  },

  getStatusColor(status) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  initializeMap(mapRef, apoiadores = [], center = [0.0349, -51.0694], onMarkerSet = null) {
    if (!mapRef.current || mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      return;
    }

    const map = L.map(mapRef.current, {
      center,
      zoom: 10,
      maxBounds: L.latLngBounds(amapaPolygon),
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.polygon(amapaPolygon, { color: 'blue', fillOpacity: 0.1 }).addTo(map);

    apoiadores.forEach((apoiador) => {
      if (apoiador.lat && apoiador.lng) {
        L.marker([apoiador.lat, apoiador.lng])
          .addTo(map)
          .bindPopup(`<b>${apoiador.name}</b><br>${apoiador.address}`);
      }
    });

    if (onMarkerSet) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const isInside = L.polygon(amapaPolygon).getBounds().contains(e.latlng);
        if (!isInside) return;
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) layer.remove();
        });
        L.marker([lat, lng]).addTo(map);
        onMarkerSet({ lat, lng });
      });
    }

    mapRef.current.mapInstance = map;
  },

  cleanupMap(mapRef) {
    if (mapRef.current?.mapInstance) {
      mapRef.current.mapInstance.remove();
      mapRef.current.mapInstance = null;
    }
  },

  async fetchSupporters(params) {
    try {
      const response = await api.get('/api/v1/supporter', { params });
      return { data: response.data.data || [], totalPages: response.data.totalPages || 1 };
    } catch (error) {
      throw processError(error, 'Erro ao buscar apoiadores');
    }
  },

  async createSupporter(data) {
    try {
      const response = await api.post('/api/v1/supporter', data);
      return response.data;
    } catch (error) {
      throw processError(error, 'Erro ao criar apoiador');
    }
  },

  async deleteSupporter(id) {
    try {
      const response = await api.delete(`/api/v1/supporter/${id}`);
      return response.data;
    } catch (error) {
      throw processError(error, 'Erro ao excluir apoiador');
    }
  },
};

export default supporterService;