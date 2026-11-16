import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Maximize2, Navigation } from 'lucide-react';
import { MacroUnitType, NetworkUnit } from '../types/network';
import { geocodeAddressNominatim, SJC_CENTER } from '../utils/sjcGeocode';

interface NetworkMapProps {
  units: NetworkUnit[];
  selectedUnitId: string | null;
  onSelectUnit: (unit: NetworkUnit) => void;
  loading: boolean;
}

const MACRO_COLOR: Record<MacroUnitType, string> = {
  FUNDHAS: '#0F2C59',
  Educação: '#2563EB',
  'Esporte e Lazer': '#F97316',
  Saúde: '#0D9488',
  'Assistência Social': '#7C3AED',
  'OSC / Parceiras': '#D97706',
  Cultura: '#DB2777',
  'Serviços / PEV': '#475569',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPopupHtml(unit: NetworkUnit, exactCoords?: [number, number] | null): string {
  const accent = MACRO_COLOR[unit.macroTipo] || '#2563EB';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${unit.nome}, ${unit.endereco}, ${unit.bairro}, São José dos Campos, SP`
  )}`;
  const coordsLabel = exactCoords
    ? `${exactCoords[0].toFixed(5)}, ${exactCoords[1].toFixed(5)} (Nominatim)`
    : unit.geocodeSource === 'csv'
    ? 'Coordenada exata da planilha'
    : unit.geocodeSource === 'unidade_exata'
    ? 'Coordenada georreferenciada da unidade'
    : `Referência territorial (${unit.bairro})`;

  return `
    <div style="font-family: 'DM Sans', sans-serif; color: #0f172a;">
      <div style="background: ${accent}; color: #ffffff; padding: 10px 14px;">
        <div style="font-size: 11px; opacity: 0.88; font-weight: 500;">${escapeHtml(unit.macroTipo)} · ${escapeHtml(unit.categoriaOriginal)}</div>
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; line-height: 1.3; margin-top: 2px;">${escapeHtml(unit.nome)}</div>
      </div>
      <div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 7px; font-size: 12px; line-height: 1.45;">
        <div><strong style="color: #0F2C59;">Endereço:</strong> ${escapeHtml(unit.endereco)} — ${escapeHtml(unit.bairro)} (${escapeHtml(unit.regiao)})</div>
        <div><strong style="color: #0F2C59;">Telefone:</strong> ${escapeHtml(unit.telefone)}</div>
        <div><strong style="color: #0F2C59;">Responsável / Ref.:</strong> ${escapeHtml(unit.responsavel)}</div>
        <div><strong style="color: #0F2C59;">Cursos / Público:</strong> ${escapeHtml(unit.publicoObjetivo)}</div>
        ${
          unit.atendidos !== null || unit.vagas !== null
            ? `<div><strong style="color: #0F2C59;">Atendidos / Vagas:</strong> ${unit.atendidos ?? '—'} / ${unit.vagas ?? '—'}</div>`
            : ''
        }
        <div style="padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span style="font-size: 10.5px; color: #64748b;">${escapeHtml(coordsLabel)}</span>
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563EB; font-weight: 600; text-decoration: none; white-space: nowrap;">Abrir no Maps →</a>
        </div>
      </div>
    </div>
  `;
}

type BasemapMode = 'osm_light' | 'esri_gray';

export function NetworkMap({ units, selectedUnitId, onSelectUnit, loading }: NetworkMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.LayerGroup | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const [geocodingStatus, setGeocodingStatus] = useState<string>('');
  const [basemap, setBasemap] = useState<BasemapMode>('osm_light');

  const mappableUnits = units.filter((u) => !u.isSigiloso);
  const sigilosoCount = units.length - mappableUnits.length;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SJC_CENTER,
      zoom: 12,
      zoomControl: true,
      preferCanvas: true,
    });

    const tileGroup = L.layerGroup().addTo(map);
    const layerGroup = L.layerGroup().addTo(map);

    mapRef.current = map;
    tileLayerRef.current = tileGroup;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tileGroup = tileLayerRef.current;
    if (!tileGroup) return;

    tileGroup.clearLayers();

    if (basemap === 'osm_light') {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        className: 'osm-executive-tiles',
      }).addTo(tileGroup);
    } else {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
        }
      ).addTo(tileGroup);
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
        }
      ).addTo(tileGroup);
    }
  }, [basemap]);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    const map = mapRef.current;
    if (!layerGroup || !map) return;

    layerGroup.clearLayers();
    markersByIdRef.current.clear();

    // Render non-FUNDHAS markers first, then FUNDHAS markers on top for clear visual hierarchy
    const ordered = [...mappableUnits].sort((a, b) => {
      if (a.isFundhas && !b.isFundhas) return 1;
      if (!a.isFundhas && b.isFundhas) return -1;
      return 0;
    });

    ordered.forEach((unit) => {
      const isFundhas = unit.isFundhas;
      const isSelected = unit.id === selectedUnitId;
      const color = MACRO_COLOR[unit.macroTipo] || '#2563EB';

      const marker = L.circleMarker([unit.lat, unit.lng], {
        radius: isSelected ? 10 : isFundhas ? 8 : 5.5,
        color: isSelected ? '#F97316' : '#ffffff',
        weight: isSelected ? 3 : isFundhas ? 2 : 1.2,
        fillColor: color,
        fillOpacity: isFundhas ? 0.96 : 0.84,
      });

      marker.bindPopup(buildPopupHtml(unit), { maxWidth: 320 });
      marker.on('click', () => {
        onSelectUnit(unit);
      });

      marker.addTo(layerGroup);
      markersByIdRef.current.set(unit.id, marker);
    });
  }, [mappableUnits, selectedUnitId, onSelectUnit]);

  useEffect(() => {
    if (!selectedUnitId || !mapRef.current) return;
    const marker = markersByIdRef.current.get(selectedUnitId);
    if (marker) {
      const latLng = marker.getLatLng();
      mapRef.current.flyTo(latLng, Math.max(mapRef.current.getZoom(), 14), { duration: 0.45 });
      marker.openPopup();
    }
  }, [selectedUnitId]);

  const handleResetZoom = () => {
    if (!mapRef.current) return;
    if (mappableUnits.length > 0 && mappableUnits.length < 300) {
      const bounds = L.latLngBounds(mappableUnits.map((u) => [u.lat, u.lng] as [number, number]));
      mapRef.current.fitBounds(bounds.pad(0.12), { maxZoom: 15 });
    } else {
      mapRef.current.setView(SJC_CENTER, 12);
    }
  };

  const handleGeocodeSelected = async () => {
    if (!selectedUnitId || !mapRef.current) return;
    const unit = mappableUnits.find((u) => u.id === selectedUnitId);
    if (!unit) return;
    setGeocodingStatus('Buscando coordenadas exatas...');
    const coords = await geocodeAddressNominatim(unit.endereco, unit.bairro);
    if (coords && markersByIdRef.current.has(unit.id)) {
      const marker = markersByIdRef.current.get(unit.id)!;
      marker.setLatLng(coords);
      marker.setPopupContent(buildPopupHtml(unit, coords));
      mapRef.current.flyTo(coords, 16, { duration: 0.5 });
      marker.openPopup();
      setGeocodingStatus('Localização refinada via endereço exato.');
    } else {
      setGeocodingStatus('Endereço mantido na referência do bairro.');
    }
    setTimeout(() => setGeocodingStatus(''), 3500);
  };

  return (
    <section
      aria-label="Mapa Interativo da Rede em São José dos Campos"
      className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col"
    >
      <div className="px-5 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0F2C59]">
            Mapa Territorial — São José dos Campos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {mappableUnits.length.toLocaleString('pt-BR')} unidades plotadas
            {sigilosoCount > 0 ? ` · ${sigilosoCount} unidades sigilosas ocultadas do mapa` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="Estilo do mapa">
            <button
              type="button"
              onClick={() => setBasemap('osm_light')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                basemap === 'osm_light'
                  ? 'bg-white text-[#0F2C59] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ruas (OSM)
            </button>
            <button
              type="button"
              onClick={() => setBasemap('esri_gray')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                basemap === 'esri_gray'
                  ? 'bg-white text-[#0F2C59] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Claro (Esri)
            </button>
          </div>
          {selectedUnitId && (
            <button
              type="button"
              onClick={handleGeocodeSelected}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2563EB] bg-blue-50 hover:bg-blue-100/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              Refinar pino selecionado
            </button>
          )}
          <button
            type="button"
            onClick={handleResetZoom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            Enquadrar SJC
          </button>
        </div>
      </div>

      <div className="relative h-[430px] lg:h-[490px] w-full">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
        {loading && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="text-sm font-medium text-[#0F2C59]">Carregando mapa e coordenadas da rede...</div>
          </div>
        )}
        {geocodingStatus && (
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F2C59] shadow-sm">
            {geocodingStatus}
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-200/80 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
        {(Object.keys(MACRO_COLOR) as MacroUnitType[]).map((tipo) => (
          <span key={tipo} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: MACRO_COLOR[tipo] }}
              aria-hidden="true"
            />
            {tipo}
          </span>
        ))}
      </div>
    </section>
  );
}
