import { Building2, Compass, MapPin, Users } from 'lucide-react';
import { DatasetMeta, NetworkUnit } from '../types/network';

interface KpiStripProps {
  filteredUnits: NetworkUnit[];
  totalUnfilteredCount: number;
  meta: DatasetMeta | null;
  loading: boolean;
}

export function KpiStrip({ filteredUnits, totalUnfilteredCount, meta, loading }: KpiStripProps) {
  if (loading) {
    return (
      <section aria-label="Indicadores Principais" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 p-5 h-[118px] animate-pulse flex flex-col justify-between"
          >
            <div className="h-3.5 w-32 bg-slate-200 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </section>
    );
  }

  const totalUnidades = filteredUnits.length;
  const fundhasCount = filteredUnits.filter((u) => u.isFundhas).length;

  const totalAtendidos = filteredUnits.reduce((acc, u) => acc + (u.atendidos ?? 0), 0);
  const totalVagas = filteredUnits.reduce((acc, u) => acc + (u.vagas ?? 0), 0);
  const hasNumericHeadcount = Boolean(meta?.hasNumericAtendimentos && (totalAtendidos > 0 || totalVagas > 0));

  const distinctRefUnits = new Set(
    filteredUnits
      .map((u) => u.unidadeReferencia)
      .filter((r) => r && r !== 'Sem referência definida')
  ).size;

  const regioesAtendidas = new Set(
    filteredUnits.map((u) => u.regiao).filter((r) => r && r !== 'Não informada')
  ).size;

  const bairrosCobertos = new Set(
    filteredUnits
      .map((u) => u.bairro)
      .filter((b) => b && b !== 'Não informado')
      .map((b) => b.toLowerCase())
  ).size;

  const cards = [
    {
      label: 'Total de Unidades',
      value: totalUnidades.toLocaleString('pt-BR'),
      subtext:
        totalUnidades === totalUnfilteredCount
          ? `${fundhasCount} unidades próprias FUNDHAS`
          : `De ${totalUnfilteredCount.toLocaleString('pt-BR')} mapeadas · ${fundhasCount} FUNDHAS`,
      icon: Building2,
      accentBg: 'bg-[#0F2C59]/8 text-[#0F2C59]',
    },
    {
      label: hasNumericHeadcount ? 'Total de Atendidos / Vagas' : 'Atendidos / Ref. FUNDHAS',
      value: hasNumericHeadcount
        ? (totalAtendidos || totalVagas).toLocaleString('pt-BR')
        : distinctRefUnits.toLocaleString('pt-BR'),
      subtext: hasNumericHeadcount
        ? totalVagas > 0 && totalAtendidos > 0
          ? `${totalAtendidos.toLocaleString('pt-BR')} atendidos · ${totalVagas.toLocaleString('pt-BR')} vagas`
          : 'Total somado na planilha'
        : `Polos de referência ativos (CSV sem coluna numérica de vagas)`,
      icon: Users,
      accentBg: 'bg-[#F97316]/10 text-[#F97316]',
    },
    {
      label: 'Regiões Atendidas',
      value: regioesAtendidas.toLocaleString('pt-BR'),
      subtext: regioesAtendidas > 0 ? 'Zonas territoriais de SJC cobertas' : 'Nenhuma região com recorte atual',
      icon: Compass,
      accentBg: 'bg-[#2563EB]/10 text-[#2563EB]',
    },
    {
      label: 'Bairros Cobertos',
      value: bairrosCobertos.toLocaleString('pt-BR'),
      subtext: bairrosCobertos > 0 ? 'Bairros e distritos alcançados' : 'Sem bairros no filtro selecionado',
      icon: MapPin,
      accentBg: 'bg-[#0F2C59]/8 text-[#0F2C59]',
    },
  ];

  return (
    <section aria-label="Indicadores Principais" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between gap-3 transition-colors duration-150 hover:border-slate-300"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-slate-600">{card.label}</span>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.accentBg}`}>
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <div className="text-3xl font-bold tracking-tight text-[#0F2C59] font-display tabular-nums">
              {card.value}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed truncate" title={card.subtext}>
              {card.subtext}
            </p>
          </article>
        );
      })}
    </section>
  );
}
