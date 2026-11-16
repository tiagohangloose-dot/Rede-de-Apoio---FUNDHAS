import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FilterToolbar } from './components/FilterToolbar';
import { KpiStrip } from './components/KpiStrip';
import { NetworkCharts } from './components/NetworkCharts';
import { NetworkMap } from './components/NetworkMap';
import { UnitsTable } from './components/UnitsTable';
import { CsvSourceConfig, DatasetMeta, FilterState, NetworkUnit } from './types/network';
import {
  coerceGoogleSheetInput,
  DEFAULT_GOOGLE_SHEET_MAPPING_URL,
  fetchServerDefaultSources,
  loadNetworkDataset,
} from './utils/csvLoader';

const AUTO_REFRESH_MS = 180_000;

const INITIAL_FILTERS: FilterState = {
  regiao: '',
  bairro: '',
  categoria: '',
  macroTipo: '',
  curso: '',
  unidadeReferencia: '',
  onlyFundhas: false,
  search: '',
};

function readUrlParamSources(): CsvSourceConfig | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const sheet = params.get('sheet')?.trim() || '';
    const mapping = params.get('mapping')?.trim() || '';
    const resolved = coerceGoogleSheetInput(mapping || sheet);
    if (resolved) {
      return {
        unitsUrl: '',
        mappingUrl: resolved,
      };
    }
  } catch {
    // Ignore URL parsing issues
  }
  return null;
}

function readInitialSources(): CsvSourceConfig {
  return readUrlParamSources() || { unitsUrl: '', mappingUrl: DEFAULT_GOOGLE_SHEET_MAPPING_URL };
}

export default function App() {
  const [sourceConfig, setSourceConfig] = useState<CsvSourceConfig>(readInitialSources);
  const [sourcesBootstrapped, setSourcesBootstrapped] = useState<boolean>(() => Boolean(readUrlParamSources()));
  const [units, setUnits] = useState<NetworkUnit[]>([]);
  const [meta, setMeta] = useState<DatasetMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const lastFetchAtRef = useRef<number>(0);

  const fetchDataset = useCallback(async (cfg: CsvSourceConfig) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { units: parsedUnits, meta: parsedMeta } = await loadNetworkDataset(cfg);
      if (parsedUnits.length === 0) {
        setErrorMsg(
          'O CSV foi lido, mas nenhum registro válido foi encontrado. Verifique se as colunas (Instituição, Categoria, Endereço, Bairro, Região) estão preenchidas.'
        );
      }
      setUnits(parsedUnits);
      setMeta(parsedMeta);
      lastFetchAtRef.current = Date.now();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados CSV.';
      setErrorMsg(
        `Não foi possível carregar os dados da planilha (${message}).`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sourcesBootstrapped) return;
    let active = true;
    fetchServerDefaultSources().then((serverCfg) => {
      if (!active) return;
      if (serverCfg.mappingUrl || serverCfg.unitsUrl) {
        setSourceConfig({ unitsUrl: '', mappingUrl: serverCfg.mappingUrl || serverCfg.unitsUrl });
      }
      setSourcesBootstrapped(true);
    });
    return () => {
      active = false;
    };
  }, [sourcesBootstrapped]);

  useEffect(() => {
    if (!sourcesBootstrapped) return;
    fetchDataset(sourceConfig);
  }, [fetchDataset, sourceConfig, sourcesBootstrapped]);

  useEffect(() => {
    const isLiveSheet = Boolean(sourceConfig.mappingUrl.trim() || sourceConfig.unitsUrl.trim());
    if (!isLiveSheet) return;

    const timer = window.setInterval(() => {
      fetchDataset(sourceConfig);
    }, AUTO_REFRESH_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetchAtRef.current > 60_000) {
        fetchDataset(sourceConfig);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchDataset, sourceConfig]);

  const handleRestoreDefault = () => {
    setSourcesBootstrapped(true);
    setSourceConfig({ unitsUrl: '', mappingUrl: DEFAULT_GOOGLE_SHEET_MAPPING_URL });
    setSelectedUnitId(null);
    void fetchDataset({ unitsUrl: '', mappingUrl: DEFAULT_GOOGLE_SHEET_MAPPING_URL });
  };

  const filterOptions = useMemo(() => {
    const regioes = Array.from(new Set(units.map((u) => u.regiao).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );

    const scopedForBairro = filters.regiao ? units.filter((u) => u.regiao === filters.regiao) : units;
    const bairros = Array.from(
      new Set(scopedForBairro.map((u) => u.bairro).filter((b) => b && b !== 'Não informado'))
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const categorias = Array.from(new Set(units.map((u) => u.categoriaOriginal))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );

    const cursos = Array.from(new Set(units.flatMap((u) => u.cursosTags))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );

    const referencias = Array.from(
      new Set(units.map((u) => u.unidadeReferencia).filter((r) => r && r !== 'Sem referência definida'))
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return { regioes, bairros, categorias, cursos, referencias };
  }, [units, filters.regiao]);

  const filteredUnits = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();
    return units.filter((u) => {
      if (filters.onlyFundhas && !u.isFundhas) return false;
      if (filters.regiao && u.regiao !== filters.regiao) return false;
      if (filters.bairro && u.bairro !== filters.bairro) return false;
      if (filters.categoria && u.categoriaOriginal !== filters.categoria) return false;
      if (filters.macroTipo && u.macroTipo !== filters.macroTipo) return false;
      if (filters.unidadeReferencia && u.unidadeReferencia !== filters.unidadeReferencia) return false;
      if (filters.curso && !u.cursosTags.includes(filters.curso)) return false;

      if (searchLower) {
        const haystack = `${u.nome} ${u.categoriaOriginal} ${u.macroTipo} ${u.endereco} ${u.bairro} ${u.regiao} ${u.telefone} ${u.unidadeReferencia} ${u.publicoObjetivo}`.toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      return true;
    });
  }, [units, filters]);

  const handleUpdateFilters = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSelectedUnitId(null);
  };

  const handleLocateUnit = useCallback((unit: NetworkUnit) => {
    setSelectedUnitId(unit.id);
    if (!unit.isSigiloso && mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-900">
      {/* Top Bar Contract: 3-zone executive header */}
      <header className="bg-[#0F2C59] text-white border-b border-[#0A1E3D]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <a
            href="#topo"
            className="text-base sm:text-lg font-extrabold tracking-tight font-display whitespace-nowrap shrink-0"
          >
            REDE DE ATENDIMENTO FUNDHAS
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-blue-100/90">
            <a href="#indicadores" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Indicadores
            </a>
            <a href="#mapa-rede" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Mapa SJC
            </a>
            <a href="#graficos" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Gráficos
            </a>
            <a href="#diretorio" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Unidades
            </a>
          </nav>
        </div>
      </header>

      <main id="topo" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Contextual Executive Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F2C59] font-display">
              Painel Executivo Territorial — São José dos Campos
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {meta
                ? `${meta.sourceLabel} · Atualizado em ${meta.dataAtualizacao}`
                : 'Carregando dados dinâmicos da rede de atendimento...'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchDataset(sourceConfig)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Atualizar dados
          </button>
        </div>

        {/* Error Banner if CSV loading or parsing encountered an issue */}
        {errorMsg && (
          <div
            role="alert"
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <strong className="font-semibold">Aviso no carregamento dos dados: </strong>
                {errorMsg}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRestoreDefault}
              className="px-3 py-1.5 rounded-lg bg-[#0F2C59] text-white text-xs font-semibold hover:bg-[#173d7a] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Recarregar planilha padrão
            </button>
          </div>
        )}

        {/* Dynamic Filters */}
        <FilterToolbar
          filters={filters}
          onChange={handleUpdateFilters}
          onReset={handleResetFilters}
          options={filterOptions}
          totalCount={units.length}
          filteredCount={filteredUnits.length}
        />

        {/* 4 Executive KPI Cards */}
        <div id="indicadores">
          <KpiStrip
            filteredUnits={filteredUnits}
            totalUnfilteredCount={units.length}
            meta={meta}
            loading={loading}
          />
        </div>

        {/* Interactive Map + 2 Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <div id="mapa-rede" ref={mapSectionRef} className="xl:col-span-7">
            <NetworkMap
              units={filteredUnits}
              selectedUnitId={selectedUnitId}
              onSelectUnit={(u) => setSelectedUnitId(u.id)}
              loading={loading}
            />
          </div>

          <div id="graficos" className="xl:col-span-5">
            <NetworkCharts
              units={filteredUnits}
              meta={meta}
              activeTipo={filters.macroTipo}
              activeRegiao={filters.regiao}
              onToggleTipo={(macroTipo) =>
                handleUpdateFilters({
                  macroTipo,
                  categoria: macroTipo === 'FUNDHAS' ? 'FUNDHAS' : '',
                  onlyFundhas: macroTipo === 'FUNDHAS',
                })
              }
              onToggleRegiao={(regiao) => handleUpdateFilters({ regiao, bairro: '' })}
            />
          </div>
        </div>

        {/* Interactive Bottom Table */}
        <div id="diretorio">
          <UnitsTable
            units={filteredUnits}
            search={filters.search}
            onSearchChange={(search) => handleUpdateFilters({ search })}
            selectedUnitId={selectedUnitId}
            onLocateUnit={handleLocateUnit}
            onResetFilters={handleResetFilters}
            loading={loading}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Rede de Atendimento FUNDHAS · São José dos Campos, SP</span>
          <span>Mapa base OpenStreetMap / Esri Light Gray · Processamento dinâmico via PapaParse</span>
        </div>
      </footer>
    </div>
  );
}
