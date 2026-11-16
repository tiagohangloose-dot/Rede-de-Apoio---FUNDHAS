import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, Database, Link2, RefreshCw, Upload, X } from 'lucide-react';
import { CsvSourceConfig } from '../types/network';
import { coerceGoogleSheetInput } from '../utils/csvLoader';

interface DataSourceModalProps {
  open: boolean;
  onClose: () => void;
  config: CsvSourceConfig;
  onApplyUrls: (next: CsvSourceConfig) => void;
  onUploadFile: (file: File) => void;
  onRestoreDefault: () => void;
}

export function DataSourceModal({
  open,
  onClose,
  config,
  onApplyUrls,
  onUploadFile,
  onRestoreDefault,
}: DataSourceModalProps) {
  const [mappingUrl, setMappingUrl] = useState(config.mappingUrl);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  useEffect(() => {
    if (open) {
      setMappingUrl(config.mappingUrl || config.unitsUrl || '');
      setCopiedShareLink(false);
    }
  }, [open, config.mappingUrl, config.unitsUrl]);

  if (!open) return null;

  const cleanInput = coerceGoogleSheetInput(mappingUrl);
  const hasGoogleLink = Boolean(cleanInput);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onApplyUrls({ unitsUrl: '', mappingUrl: cleanInput });
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      onClose();
    }
  };

  const handleCopyShareableUrl = async () => {
    if (!cleanInput) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('units');
    url.searchParams.delete('mapping');
    url.searchParams.set('sheet', cleanInput);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch {
      // Ignore clipboard failure in restricted iframes
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-950/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-modal-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
            <h2 id="csv-modal-title" className="text-base font-bold text-[#0F2C59]">
              Conectar Aba Mapeamento (Google Sheets)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-[#0F2C59]">
              Conecte apenas a aba Mapeamento em tempo real:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>
                No Google Sheets, abra a aba <strong className="text-slate-800">Mapeamento</strong> e clique em{' '}
                <strong className="text-slate-800">Compartilhar → Qualquer pessoa com o link (Leitor)</strong>{' '}
                *(ou Arquivo → Compartilhar → Publicar na web → .csv)*.
              </li>
              <li>
                Copie o link da barra do navegador (ex.: <code className="bg-white px-1 rounded border border-slate-200">.../edit?gid=...</code>) e cole abaixo.
              </li>
              <li>
                O painel sincroniza automaticamente a cada 3 minutos e sempre que clicar em{' '}
                <strong className="text-slate-800">Atualizar dados</strong>.
              </li>
            </ol>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#0F2C59]">
              Link ou ID da Aba Mapeamento (Google Sheets)
            </span>
            <input
              type="text"
              value={mappingUrl}
              onChange={(e) => setMappingUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/SEU_ID/edit?gid=0"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </label>

          {hasGoogleLink && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-500">
                Enviar para outras profissionais já conectado nesta planilha:
              </span>
              <button
                type="button"
                onClick={handleCopyShareableUrl}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[11px] font-semibold text-[#2563EB] transition-colors shrink-0 cursor-pointer"
              >
                {copiedShareLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    Link copiado
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Copiar link compartilhável
                  </>
                )}
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                Importar CSV local
                <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  onRestoreDefault();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                Restaurar planilha padrão
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0F2C59] text-white text-xs font-semibold hover:bg-[#173d7a] transition-colors cursor-pointer"
            >
              Conectar e carregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
