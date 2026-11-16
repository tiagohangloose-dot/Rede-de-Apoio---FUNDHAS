import { useMemo, useState } from 'react';
import { ArrowDownUp, ChevronLeft, ChevronRight, Download, MapPin, Search, X } from 'lucide-react';
import { NetworkUnit } from '../types/network';
import { exportUnitsToCsv } from '../utils/csvLoader';

interface UnitsTableProps {
  units: NetworkUnit[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedUnitId: string | null;
  onLocateUnit: (unit: NetworkUnit) => void;
  onResetFilters: () => void;
  loading: boolean;
}

type SortField = 'nome' | 'macroTipo' | 'bairro' | 'regiao' | 'unidadeReferencia';

export function UnitsTable({
  units,
  search,
  onSearchChange,
  selectedUnitId,
  onLocateUnit,
  onResetFilters,
  loading,
}: UnitsTableProps) {
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const sortedUnits = useMemo(() => {
    const copy = [...units];
    copy.sort((a, b) => {
      const va = (a[sortField] || '').toLowerCase();
      const vb = (b[sortField] || '').toLowerCase();
      return sortAsc ? va.localeCompare(vb, 'pt-BR') : vb.localeCompare(va, 'pt-BR');
    });
    return copy;
  }, [units, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedUnits.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedUnits = sortedUnits.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setPage(1);
  };

  return (
    <section
      aria-label="Lista Completa de Unidades Filtradas"
      className="bg-white rounded-xl border border-slate-200/80 overflow-hidden"
    >
      <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0F2C59]">
            Diretório de Unidades e Serviços Mapeados
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Exibindo {pagedUnits.length} de {sortedUnits.length.toLocaleString('pt-BR')} unidades filtradas · Clique em uma linha para localizar no mapa
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[260px] sm:w-[320px]">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar instituição, bairro, endereço, telefone..."
              aria-label="Busca rápida nas unidades"
              className="w-full h-10 pl-9 pr-8 rounded-lg border border-slate-200 bg-slate-50/70 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setPage(1);
                }}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => exportUnitsToCsv(sortedUnits)}
            disabled={sortedUnits.length === 0}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#0F2C59] hover:bg-slate-50 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Exportar CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : sortedUnits.length === 0 ? (
        <div className="py-14 px-6 text-center flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-[#0F2C59]">
            Nenhuma unidade encontrada com os critérios atuais
          </p>
          <p className="text-xs text-slate-500 max-w-md">
            Ajuste os filtros de região, bairro, tipo de unidade ou termo de busca para visualizar os registros da rede.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-1 px-4 py-2 rounded-lg bg-[#0F2C59] text-white text-xs font-medium hover:bg-[#173d7a] transition-colors cursor-pointer"
          >
            Restaurar todos os registros
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[12px] font-semibold text-slate-600">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('nome')}
                      className="inline-flex items-center gap-1 hover:text-[#0F2C59] cursor-pointer"
                    >
                      Instituição / Unidade
                      <ArrowDownUp className="w-3 h-3 opacity-60" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('macroTipo')}
                      className="inline-flex items-center gap-1 hover:text-[#0F2C59] cursor-pointer"
                    >
                      Tipo / Categoria
                      <ArrowDownUp className="w-3 h-3 opacity-60" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('bairro')}
                      className="inline-flex items-center gap-1 hover:text-[#0F2C59] cursor-pointer"
                    >
                      Endereço & Bairro
                      <ArrowDownUp className="w-3 h-3 opacity-60" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('regiao')}
                      className="inline-flex items-center gap-1 hover:text-[#0F2C59] cursor-pointer"
                    >
                      Região
                      <ArrowDownUp className="w-3 h-3 opacity-60" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('unidadeReferencia')}
                      className="inline-flex items-center gap-1 hover:text-[#0F2C59] cursor-pointer"
                    >
                      Ref. FUNDHAS
                      <ArrowDownUp className="w-3 h-3 opacity-60" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">Cursos / Público-Alvo</th>
                  <th className="py-3 px-4 text-right">Mapa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {pagedUnits.map((unit) => {
                  const isSelected = unit.id === selectedUnitId;
                  return (
                    <tr
                      key={unit.id}
                      onClick={() => onLocateUnit(unit)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50/90'
                      }`}
                    >
                      <td className="py-3 px-4 align-top max-w-[260px]">
                        <div className="font-semibold text-[#0F2C59] leading-snug">{unit.nome}</div>
                      </td>
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="font-medium text-slate-800">{unit.macroTipo}</div>
                        <div className="text-xs text-slate-500 max-w-[190px] truncate" title={unit.categoriaOriginal}>
                          {unit.categoriaOriginal}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top max-w-[250px]">
                        <div className="text-slate-800 leading-snug">{unit.endereco}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{unit.bairro}</div>
                      </td>
                      <td className="py-3 px-4 align-top whitespace-nowrap font-medium text-slate-700">
                        {unit.regiao}
                      </td>
                      <td className="py-3 px-4 align-top max-w-[180px] text-slate-700">
                        {unit.unidadeReferencia}
                      </td>
                      <td className="py-3 px-4 align-top whitespace-nowrap font-mono text-xs text-slate-600 tabular-nums">
                        {unit.telefone}
                      </td>
                      <td className="py-3 px-4 align-top max-w-[240px]">
                        <p className="text-xs text-slate-600 line-clamp-2" title={unit.publicoObjetivo}>
                          {unit.publicoObjetivo}
                        </p>
                      </td>
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                        {unit.isSigiloso ? (
                          <span className="text-xs text-slate-400">Sigiloso</span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLocateUnit(unit);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            Localizar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Linhas por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Linhas por página"
                className="h-8 px-2 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-3 tabular-nums">
              <span>
                Página {safePage} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Próxima página"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
