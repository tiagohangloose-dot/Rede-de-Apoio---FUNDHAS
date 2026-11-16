import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '../types/network';

interface FilterToolbarProps {
  filters: FilterState;
  onChange: (next: Partial<FilterState>) => void;
  onReset: () => void;
  options: {
    regioes: string[];
    bairros: string[];
    categorias: string[];
    cursos: string[];
    referencias: string[];
  };
  totalCount: number;
  filteredCount: number;
}

export function FilterToolbar({
  filters,
  onChange,
  onReset,
  options,
  totalCount,
  filteredCount,
}: FilterToolbarProps) {
  const hasActiveFilter =
    filters.regiao !== '' ||
    filters.bairro !== '' ||
    filters.categoria !== '' ||
    filters.macroTipo !== '' ||
    filters.curso !== '' ||
    filters.unidadeReferencia !== '' ||
    filters.onlyFundhas ||
    filters.search.trim() !== '';

  const fundhasCatValue =
    options.categorias.find((c) => c.trim().toUpperCase() === 'FUNDHAS') || 'FUNDHAS';

  const handleToggleOnlyFundhas = (onlyFundhas: boolean) => {
    if (onlyFundhas) {
      onChange({ onlyFundhas: true, categoria: fundhasCatValue, macroTipo: '' });
    } else {
      onChange({
        onlyFundhas: false,
        categoria: filters.categoria.toUpperCase() === 'FUNDHAS' ? '' : filters.categoria,
      });
    }
  };

  const handleCategoriaChange = (categoria: string) => {
    const isFundhas = categoria.trim().toUpperCase() === 'FUNDHAS';
    onChange({ categoria, onlyFundhas: isFundhas, macroTipo: '' });
  };

  return (
    <section
      aria-label="Filtros Dinâmicos"
      className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[#0F2C59]">Filtros Territoriais e por Categoria</h2>
          <span className="text-xs text-slate-500 tabular-nums">
            · {filteredCount.toLocaleString('pt-BR')} de {totalCount.toLocaleString('pt-BR')} registros
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="Escopo da rede">
            <button
              type="button"
              onClick={() => handleToggleOnlyFundhas(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !filters.onlyFundhas
                  ? 'bg-white text-[#0F2C59] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toda a Rede
            </button>
            <button
              type="button"
              onClick={() => handleToggleOnlyFundhas(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.onlyFundhas
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unidades FUNDHAS
            </button>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Região</span>
          <select
            value={filters.regiao}
            onChange={(e) => onChange({ regiao: e.target.value, bairro: '' })}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/70 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
          >
            <option value="">Todas as regiões</option>
            {options.regioes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Bairro</span>
          <select
            value={filters.bairro}
            onChange={(e) => onChange({ bairro: e.target.value })}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/70 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
          >
            <option value="">Todos os bairros ({options.bairros.length})</option>
            {options.bairros.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Categoria</span>
          <select
            value={filters.categoria}
            onChange={(e) => handleCategoriaChange(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/70 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
          >
            <option value="">Todas as categorias ({options.categorias.length})</option>
            {options.categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Curso / Oficina / Eixo</span>
          <select
            value={filters.curso}
            onChange={(e) => onChange({ curso: e.target.value })}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/70 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
          >
            <option value="">Todos os cursos / públicos</option>
            {options.cursos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Unidade de Referência</span>
          <select
            value={filters.unidadeReferencia}
            onChange={(e) => onChange({ unidadeReferencia: e.target.value })}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/70 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
          >
            <option value="">Todas as referências</option>
            {options.referencias.map((ref) => (
              <option key={ref} value={ref}>
                {ref}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
