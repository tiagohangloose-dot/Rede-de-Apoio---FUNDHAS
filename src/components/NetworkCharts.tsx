import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { DatasetMeta, MacroUnitType, NetworkUnit } from '../types/network';

interface NetworkChartsProps {
  units: NetworkUnit[];
  meta: DatasetMeta | null;
  activeTipo: string;
  activeRegiao: string;
  onToggleTipo: (tipo: string) => void;
  onToggleRegiao: (regiao: string) => void;
}

const TIPO_COLORS: Record<MacroUnitType, string> = {
  FUNDHAS: '#0F2C59',
  Educação: '#2563EB',
  'Esporte e Lazer': '#F97316',
  Saúde: '#0D9488',
  'Assistência Social': '#6366F1',
  'OSC / Parceiras': '#F59E0B',
  Cultura: '#EC4899',
  'Serviços / PEV': '#64748B',
};

export function NetworkCharts({
  units,
  meta,
  activeTipo,
  activeRegiao,
  onToggleTipo,
  onToggleRegiao,
}: NetworkChartsProps) {
  const doughnutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartRef = useRef<Chart | null>(null);
  const barChartRef = useRef<Chart | null>(null);

  // Aggregate by Tipo de Unidade
  const tipoMap = new Map<string, number>();
  units.forEach((u) => {
    tipoMap.set(u.macroTipo, (tipoMap.get(u.macroTipo) || 0) + 1);
  });
  const tipoEntries = Array.from(tipoMap.entries()).sort((a, b) => b[1] - a[1]);

  // Aggregate by Região (count or Atendidos if numeric column exists)
  const useHeadcountMetric = Boolean(
    meta?.hasNumericAtendimentos && units.some((u) => (u.atendidos ?? 0) > 0 || (u.vagas ?? 0) > 0)
  );
  const regiaoMap = new Map<string, number>();
  units.forEach((u) => {
    const key = u.regiao || 'Não informada';
    const val = useHeadcountMetric ? (u.atendidos ?? u.vagas ?? 0) : 1;
    regiaoMap.set(key, (regiaoMap.get(key) || 0) + val);
  });
  const regiaoEntries = Array.from(regiaoMap.entries()).sort((a, b) => b[1] - a[1]);

  useEffect(() => {
    const canvas = doughnutCanvasRef.current;
    if (!canvas) return;

    if (doughnutChartRef.current) {
      doughnutChartRef.current.destroy();
    }

    const labels = tipoEntries.map(([k]) => k);
    const data = tipoEntries.map(([, v]) => v);
    const colors = labels.map((lbl) => {
      const base = TIPO_COLORS[lbl as MacroUnitType] || '#2563EB';
      if (activeTipo && activeTipo !== lbl) return `${base}4D`;
      return base;
    });

    doughnutChartRef.current = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        onClick: (_evt, elements) => {
          if (elements.length > 0) {
            const clickedLabel = labels[elements[0].index];
            onToggleTipo(activeTipo === clickedLabel ? '' : clickedLabel);
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 12,
              font: { family: "'DM Sans', sans-serif", size: 11.5 },
              color: '#334155',
            },
          },
          tooltip: {
            backgroundColor: '#0F2C59',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const total = data.reduce((a, b) => a + b, 0) || 1;
                const val = Number(ctx.raw || 0);
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${val.toLocaleString('pt-BR')} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      doughnutChartRef.current?.destroy();
    };
  }, [tipoEntries.map((e) => e.join(':')).join('|'), activeTipo]);

  useEffect(() => {
    const canvas = barCanvasRef.current;
    if (!canvas) return;

    if (barChartRef.current) {
      barChartRef.current.destroy();
    }

    const labels = regiaoEntries.map(([k]) => k);
    const data = regiaoEntries.map(([, v]) => v);
    const barColors = labels.map((lbl, idx) => {
      if (activeRegiao && activeRegiao !== lbl) return '#CBD5E1';
      if (activeRegiao === lbl) return '#F97316';
      return idx === 0 ? '#0F2C59' : '#2563EB';
    });

    barChartRef.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: useHeadcountMetric ? 'Atendidos / Vagas' : 'Unidades na Rede',
            data,
            backgroundColor: barColors,
            borderRadius: 6,
            maxBarThickness: 44,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_evt, elements) => {
          if (elements.length > 0) {
            const clickedLabel = labels[elements[0].index];
            onToggleRegiao(activeRegiao === clickedLabel ? '' : clickedLabel);
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F2C59',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) =>
                ` ${useHeadcountMetric ? 'Atendidos/Vagas' : 'Unidades'}: ${Number(ctx.raw || 0).toLocaleString('pt-BR')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'DM Sans', sans-serif", size: 12 },
              color: '#334155',
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            border: { display: false },
            ticks: {
              precision: 0,
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#64748B',
            },
          },
        },
      },
    });

    return () => {
      barChartRef.current?.destroy();
    };
  }, [regiaoEntries.map((e) => e.join(':')).join('|'), activeRegiao, useHeadcountMetric]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
      <section
        aria-label="Distribuição por Tipo de Unidade"
        className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-[#0F2C59]">Distribuição por Tipo de Unidade</h2>
            <p className="text-xs text-slate-500 mt-0.5">Clique em uma fatia para filtrar</p>
          </div>
          {activeTipo && (
            <button
              type="button"
              onClick={() => onToggleTipo('')}
              className="text-xs font-medium text-[#F97316] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Limpar ({activeTipo})
            </button>
          )}
        </div>
        <div className="relative h-[225px] w-full">
          {tipoEntries.length > 0 ? (
            <canvas ref={doughnutCanvasRef} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Sem dados para o filtro atual
            </div>
          )}
        </div>
      </section>

      <section
        aria-label="Atendimentos por Região"
        className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-[#0F2C59]">
              {useHeadcountMetric ? 'Atendimentos por Região' : 'Unidades Atendidas por Região'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Clique em uma barra para filtrar</p>
          </div>
          {activeRegiao && (
            <button
              type="button"
              onClick={() => onToggleRegiao('')}
              className="text-xs font-medium text-[#F97316] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Limpar ({activeRegiao})
            </button>
          )}
        </div>
        <div className="relative h-[205px] w-full">
          {regiaoEntries.length > 0 ? (
            <canvas ref={barCanvasRef} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Sem dados para o filtro atual
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
