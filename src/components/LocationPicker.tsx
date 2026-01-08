import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Locate, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Map, Marker, LeafletMouseEvent } from "leaflet";

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coords?: { lat: number; lng: number }) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const resultsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Chile center coordinates
  const defaultCenter = { lat: -33.4489, lng: -70.6693 };

  // Initialize Leaflet map
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      // Dynamic import of Leaflet
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 5,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Click handler
      map.on("click", async (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng, L, map);
        await reverseGeocode(lat, lng);
      });

      mapRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position
  const updateMarker = useCallback(async (lat: number, lng: number, L?: any, map?: Map) => {
    const leaflet = L || await import("leaflet");
    const currentMap = map || mapRef.current;
    
    if (!currentMap) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = leaflet.marker([lat, lng]).addTo(currentMap);
    }

    currentMap.flyTo([lat, lng], 13, { duration: 1 });
    setPosition({ lat, lng });
  }, []);

  // Reverse geocode
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await response.json();
      if (data.display_name) {
        setSearchQuery(data.display_name);
        onChange(data.display_name, { lat, lng });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      toast.error("No se pudo obtener la dirección", {
        description: "Se usarán las coordenadas directamente."
      });
      onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, { lat, lng });
    }
  };

  // Search with Nominatim
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=cl&limit=5`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Error buscando ubicación", {
        description: "Intenta de nuevo o selecciona en el mapa."
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  // Handle result selection
  const handleSelectResult = async (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    await updateMarker(lat, lng);
    setSearchQuery(result.display_name);
    onChange(result.display_name, { lat, lng });
    setShowResults(false);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no disponible en tu navegador");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await updateMarker(lat, lng);
        await reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("No pudimos obtener tu ubicación");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative" ref={resultsRef}>
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!e.target.value) {
              onChange("");
            }
          }}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="Buscar ubicación en Chile..."
          className="w-full pl-12 pr-24 py-4 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-base"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPosition(null);
                if (markerRef.current && mapRef.current) {
                  mapRef.current.removeLayer(markerRef.current);
                  markerRef.current = null;
                }
                onChange("");
              }}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Usar mi ubicación actual"
          >
            <Locate size={18} className={isLocating ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3 border-b border-border last:border-0"
              >
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border p-4 text-center text-muted-foreground text-sm z-50">
            Buscando...
          </div>
        )}
      </div>

      {/* Map */}
      <div 
        ref={mapContainerRef}
        className="h-[250px] rounded-lg overflow-hidden border border-border bg-secondary"
      />

      <p className="text-muted-foreground text-sm">
        Busca una dirección o haz clic en el mapa para seleccionar la ubicación de tu terreno.
      </p>
    </div>
  );
}
