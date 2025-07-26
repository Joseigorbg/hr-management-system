import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Added Dialog components from shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { initializeMap } from '@/services/mapService';
import L from 'leaflet';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../contexts/AuthContext';

// Interface for marker data
interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  address: string;
  cep: string;
  supportType: string;
}

// Interface for supporter
interface Apoiador {
  id?: string;
  name: string;
  phone: string;
  address: string;
  cep: string;
  mapping: string;
  supportType: string;
  status: 'active' | 'inactive' | 'terminated';
  lat: number | null;
  lng: number | null;
}

const EditSupporter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apoiador, setApoiador] = useState<Apoiador | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  // Added state for dialog control
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCoordinates, setNewCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const editMapRef = useRef<HTMLDivElement | null>(null);
  const editMapInstance = useRef<L.Map | null>(null);
  // Added ref to store marker instance
  const markerRef = useRef<L.Marker | null>(null);

  // Mock addresses for autocomplete
  const mockAddresses = [
    'Rua das Flores, 123, Macapá, AP',
    'Avenida Beira Rio, 456, Macapá, AP',
    'Travessa São José, 789, Macapá, AP',
  ];

  useEffect(() => {
    console.log('ID recebido:', id);
    const fetchApoiador = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/v1/supporter/${id}`);
        if (!response.data) {
          throw new Error('Apoiador não encontrado');
        }
        console.log('Apoiador carregado:', JSON.stringify(response.data, null, 2));
        setApoiador(response.data);
      } catch (error: any) {
        console.error('Erro ao buscar apoiador:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast.error(error.response?.data?.message || 'Erro ao carregar apoiador', { duration: 3000 });
        navigate('/supporter');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchApoiador();
  }, [id, navigate]);

  const validateApoiador = (apoiador: Apoiador): string | null => {
    if (!apoiador.name) return 'Nome é obrigatório';
    if (!apoiador.phone) return 'Telefone é obrigatório';
    if (!apoiador.address) return 'Endereço é obrigatório';
    if (!apoiador.cep) return 'CEP é obrigatório';
    if (!apoiador.mapping) return 'Mapeamento é obrigatório';
    if (!apoiador.supportType) return 'Tipo de suporte é obrigatório';
    if (apoiador.lat === null || apoiador.lng === null || isNaN(apoiador.lat) || isNaN(apoiador.lng)) {
      return 'Localização no mapa é obrigatória';
    }
    return null;
  };

  const handleEditApoiador = async () => {
    if (!apoiador) return;
    const error = validateApoiador(apoiador);
    if (error) {
      toast.error(error, { duration: 3000 });
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        name: apoiador.name,
        phone: apoiador.phone,
        address: apoiador.address,
        cep: apoiador.cep,
        mapping: apoiador.mapping,
        supportType: apoiador.supportType,
        status: apoiador.status,
        lat: Number(apoiador.lat),
        lng: Number(apoiador.lng),
      };
      console.log('Enviando requisição PATCH para /api/v1/supporter com payload:', JSON.stringify(payload, null, 2));
      const response = await api.patch(`/api/v1/supporter/${apoiador.id}`, payload);
      if (!response.data) {
        throw new Error('Erro ao atualizar apoiador');
      }
      toast.success('Apoiador atualizado com sucesso', { duration: 3000 });
      navigate('/supporter');
    } catch (error: any) {
      console.error('Erro ao atualizar apoiador:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar apoiador. Verifique os dados e tente novamente.';
      toast.error(errorMessage, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApoiador((prev) => (prev ? { ...prev, address: value } : prev));
    if (value) {
      const suggestions = mockAddresses.filter((addr) =>
        addr.toLowerCase().includes(value.toLowerCase())
      );
      setAddressSuggestions(suggestions);
    } else {
      setAddressSuggestions([]);
    }
  };

  const selectAddress = (address: string) => {
    setApoiador((prev) => (prev ? { ...prev, address } : prev));
    setAddressSuggestions([]);
  };

  // Added function to handle location confirmation
  const handleConfirmLocation = () => {
    if (newCoordinates && apoiador) {
      setApoiador({ ...apoiador, ...newCoordinates });
      setIsDialogOpen(false);
      setNewCoordinates(null);
    }
  };

  // Added function to handle location cancellation
  const handleCancelLocation = () => {
    if (markerRef.current && apoiador && apoiador.lat && apoiador.lng) {
      // Reset marker to original position
      markerRef.current.setLatLng([apoiador.lat, apoiador.lng]);
    }
    setIsDialogOpen(false);
    setNewCoordinates(null);
  };

  // Updated map initialization with draggable marker
  useEffect(() => {
    let isMounted = true;
    if (apoiador && editMapRef.current && editMapRef.current.offsetWidth && editMapRef.current.offsetHeight) {
      const initializeEditMap = () => {
        if (!editMapRef.current || !editMapRef.current.offsetWidth || !editMapRef.current.offsetHeight) {
          console.warn('Contêiner do mapa de edição não está pronto, tentando novamente...');
          requestAnimationFrame(initializeEditMap);
          return;
        }
        console.log('Inicializando mapa de edição, dimensões:', {
          width: editMapRef.current.offsetWidth,
          height: editMapRef.current.offsetHeight,
          lat: apoiador.lat,
          lng: apoiador.lng,
        });

        const markerData: MarkerData[] = apoiador.lat && apoiador.lng && !isNaN(apoiador.lat) && !isNaN(apoiador.lng)
          ? [{
              lat: apoiador.lat,
              lng: apoiador.lng,
              name: apoiador.name,
              address: apoiador.address,
              cep: apoiador.cep,
              supportType: apoiador.supportType,
            }]
          : [];

        // Initialize map with draggable marker
        initializeMap(
          editMapRef,
          editMapInstance,
          markerData,
          [apoiador.lat || 0.0349, apoiador.lng || -51.0694],
          (coords: { lat: number; lng: number }) => {
            console.log('Atualizando coordenadas:', coords);
            setNewCoordinates(coords);
            setIsDialogOpen(true); // Show dialog on drag end
          },
          true // Enable draggable marker
        );

        // Store marker reference and add dragend event
        if (editMapInstance.current && markerData.length > 0) {
          const marker = L.marker([markerData[0].lat, markerData[0].lng], {
            draggable: true,
          }).addTo(editMapInstance.current);
          
          markerRef.current = marker;
          
          marker.on('dragend', () => {
            const position = marker.getLatLng();
            setNewCoordinates({ lat: position.lat, lng: position.lng });
            setIsDialogOpen(true);
          });
        }

        if (editMapRef.current) {
          editMapRef.current.classList.add('visible');
          setTimeout(() => {
            if (editMapInstance.current) {
              editMapInstance.current.invalidateSize();
              console.log('Mapa de edição redimensionado');
            }
          }, 100);
        }
      };
      requestAnimationFrame(initializeEditMap);
    }
    return () => {
      isMounted = false;
      if (editMapInstance.current) {
        console.log('Limpando mapa de edição');
        editMapInstance.current.remove();
        editMapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [apoiador]);

  if (!apoiador) return <div>Carregando...</div>;

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Editar Apoiador: {apoiador.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div>
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium text-foreground">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={apoiador.name}
                  onChange={(e) => setApoiador({ ...apoiador, name: e.target.value })}
                  placeholder="Digite o nome do apoiador"
                  className="mt-1 border-border bg-input text-foreground rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone" className="text-sm font-medium text-foreground">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-phone"
                  value={apoiador.phone}
                  onChange={(e) => setApoiador({ ...apoiador, phone: e.target.value })}
                  placeholder="Ex: (96) 99999-9999"
                  className="mt-1 border-border bg-input text-foreground rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="edit-address" className="text-sm font-medium text-foreground">
                  Endereço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-address"
                  value={apoiador.address}
                  onChange={handleAddressChange}
                  placeholder="Digite o endereço"
                  className="mt-1 border-border bg-input text-foreground rounded-md"
                />
                {addressSuggestions.length > 0 && (
                  <ul className="mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                        onClick={() => selectAddress(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <div>
                <Label htmlFor="edit-cep" className="text-sm font-medium text-foreground">
                  CEP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-cep"
                  value={apoiador.cep}
                  onChange={(e) => setApoiador({ ...apoiador, cep: e.target.value })}
                  placeholder="Ex: 68900000"
                  className="mt-1 border-border bg-input text-foreground rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="edit-mapping" className="text-sm font-medium text-foreground">
                  Mapeamento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-mapping"
                  value={apoiador.mapping}
                  onChange={(e) => setApoiador({ ...apoiador, mapping: e.target.value })}
                  placeholder="Ex: Zona Norte, Rural"
                  className="mt-1 border-border bg-input text-foreground rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="edit-supportType" className="text-sm font-medium text-foreground">
                  Tipo de Suporte <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={apoiador.supportType}
                  onValueChange={(value) => setApoiador({ ...apoiador, supportType: value })}
                  className="mt-1"
                >
                  <SelectTrigger id="edit-supportType" className="border-border bg-input text-foreground rounded-md">
                    <SelectValue placeholder="Selecione o tipo de suporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="people">Suporte de Pessoas</SelectItem>
                    <SelectItem value="funding">Financiamento</SelectItem>
                    <SelectItem value="documents">Documentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status" className="text-sm font-medium text-foreground">
                  Status
                </Label>
                <Select
                  value={apoiador.status}
                  onValueChange={(value) => setApoiador({ ...apoiador, status: value })}
                  className="mt-1"
                >
                  <SelectTrigger id="edit-status" className="border-border bg-input text-foreground rounded-md">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="terminated">Terminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Label className="text-sm font-medium text-foreground">
              Selecionar Localização <span className="text-red-500">*</span>
            </Label>
            <div
              ref={editMapRef}
              style={{ height: '350px', width: '100%', minHeight: '350px', minWidth: '100%' }}
              className="map-container mt-1 rounded-lg border border-border bg-input"
            />
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/supporter')}
              disabled={isLoading}
              className="border-border text-foreground hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditApoiador}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Added confirmation dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Nova Localização</DialogTitle>
            <DialogDescription>
              Você deseja confirmar a nova localização para {apoiador.name}?
              <br />
              Coordenadas: Lat: {newCoordinates?.lat.toFixed(6)}, Lng: {newCoordinates?.lng.toFixed(6)}
              <br />
              Endereço: {apoiador.address}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLocation}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmLocation}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditSupporter;