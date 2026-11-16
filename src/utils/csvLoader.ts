import Papa from 'papaparse';
import { CsvSourceConfig, DatasetMeta, MacroUnitType, NetworkUnit } from '../types/network';
import { normalizeTextKey, resolveUnitCoordinates } from './sjcGeocode';

export const DEFAULT_GOOGLE_SHEET_MAPPING_URL =
  'https://docs.google.com/spreadsheets/d/1w_5xEL1ARoIFiW8laZSzZOuWEU7vbm8KXoL1QIz0LXs/edit?gid=0';

export const DEFAULT_LOCAL_CSV_URL = '/assets/aistudio/mapeamento_atendimento_rede_7b7f7db3';

type RawRow = Record<string, string | undefined>;

function cleanStr(val: string | undefined | null): string {
  if (!val) return '';
  const trimmed = val.replace(/\r/g, '').replace(/\s+/g, ' ').trim();
  if (trimmed === '—' || trimmed === '-' || trimmed === 'l') return '';
  return trimmed;
}

function normalizeCategoria(raw: string): string {
  const c = cleanStr(raw);
  if (!c) return 'Não categorizada';
  return c.replace(/^Assit[êe]ncia Social/i, 'Assistência Social');
}

function isFundhasCategoria(categoria: string): boolean {
  return normalizeTextKey(categoria) === 'fundhas';
}

function classifyMacroTipo(categoria: string, nome: string): MacroUnitType {
  const cat = normalizeTextKey(categoria);
  const nm = normalizeTextKey(nome);

  if (cat === 'fundhas') return 'FUNDHAS';
  if (cat.includes('esporte') || cat.includes('academia ar livre') || cat.includes('parque')) {
    return 'Esporte e Lazer';
  }
  if (cat.includes('cultura') || cat.includes('biblioteca')) return 'Cultura';
  if (
    cat.includes('saude') ||
    cat.includes('caps') ||
    cat.includes('uesm') ||
    cat.includes('reabilitacao') ||
    cat.includes('hospital') ||
    cat.includes('ubs') ||
    cat.includes('upa')
  ) {
    return 'Saúde';
  }
  if (cat.includes('assistencia social') || cat.includes('abrigo') || cat.includes('ilpi')) {
    return 'Assistência Social';
  }
  if (cat.includes('osc')) return 'OSC / Parceiras';
  if (
    cat.includes('educacao') ||
    cat.includes('escola') ||
    cat.includes('ensino') ||
    cat.includes('cephas') ||
    cat.includes('rede estadual') ||
    cat.includes('rede parceira') ||
    cat.includes('privada') ||
    nm.includes('emei') ||
    nm.includes('emef') ||
    nm.includes('cedin') ||
    nm.includes('cecoi')
  ) {
    return 'Educação';
  }
  if (cat.includes('urbam') || cat.includes('pev')) return 'Serviços / PEV';
  return 'OSC / Parceiras';
}

function normalizeRegiao(raw: string, bairro: string): string {
  const r = normalizeTextKey(raw);
  if (r === 'centro') return 'Centro';
  if (r === 'norte') return 'Norte';
  if (r === 'sul') return 'Sul';
  if (r === 'leste') return 'Leste';
  if (r === 'oeste') return 'Oeste';
  if (r === 'sudeste') return 'Sudeste';

  // Infer from known neighborhood if region cell was empty in CSV
  const b = normalizeTextKey(bairro);
  if (b.includes('campo dos alemaes') || b.includes('parque industrial') || b.includes('dom pedro') || b.includes('satelite')) {
    return 'Sul';
  }
  if (b.includes('putim') || b.includes('pinheirinho')) return 'Sudeste';
  if (b.includes('rodolfo') || b.includes('eugenio de melo') || b.includes('santa herminia')) return 'Leste';
  if (b.includes('alto da ponte') || b.includes('santana')) return 'Norte';
  if (b.includes('urbanova') || b.includes('limoeiro')) return 'Oeste';

  return 'Não informada';
}

function normalizeReferencia(raw: string): string {
  const val = cleanStr(raw);
  if (!val) return 'Sem referência definida';
  const k = normalizeTextKey(val);

  if (k.includes('alto da ponte')) return 'Unidade Alto da Ponte';
  if (k.includes('dom bosco') || k.includes('d bosco')) return 'Unidade Dom Bosco';
  if (k.includes('dom pedro') || k.includes('d pedro')) return 'Unidade Dom Pedro I';
  if (k.includes('eugenio de melo')) return 'Unidade Eugênio de Melo';
  if (k.includes('campos de sao jose')) return 'Unidade Campos de São José';
  if (k.includes('parque industrial') || k.includes('parque insdustrial') || k.includes('paruqe industrial')) {
    return 'Unidade Parque Industrial';
  }
  if (k.includes('desenvolvimento artistico')) return 'Centro de Desenvolvimento Artístico';
  if (k.includes('rodolfo') || k === 'unidade leste') return 'Unidade Leste (Jd. Rodolfo)';
  if (k.includes('putim')) return 'Unidade Putim';
  if (k.includes('sao jose ii')) return 'Unidade Jardim São José II';
  if (k === 'sede') return 'Sede FUNDHAS';
  if (k.includes('regiao sul')) return 'Unidades da Região Sul';
  if (k.includes('regiao leste')) return 'Unidades da Região Leste';
  if (k.includes('centro/norte')) return 'Unidades Centro / Norte';
  if (k.includes('centro')) return 'Unidade Centro';

  return val;
}

function extractCursosTags(publico: string, categoria: string): string[] {
  const tags = new Set<string>();
  const p = normalizeTextKey(`${publico} ${categoria}`);

  if (/educacao infantil|0.?5 anos|0.?3 anos|emei|cedin|cecoi|creche|bercario/i.test(p)) {
    tags.add('Educação Infantil');
  }
  if (/fundamental|1o ao 9o|6o.?9o|emef|emefi/i.test(p)) tags.add('Ensino Fundamental');
  if (/ensino medio|medio diurno|pei|novotec/i.test(p)) tags.add('Ensino Médio / Técnico');
  if (/eja|suplencia/i.test(p)) tags.add('EJA / Suplência');
  if (/inovacao|tecnologia|profissionalizante|cursos|empreendedorismo|aprendizagem|estagio|cephas|senac/i.test(p)) {
    tags.add('Qualificação / Tecnologia');
  }
  if (/tea|autismo|deficiencia|apae|sindrome de down|especial|reabilitacao|lucy montoro/i.test(p)) {
    tags.add('Inclusão / Pessoa com Deficiência');
  }
  if (/cultura|musica|coral|arte|teatro|leitura|biblioteca/i.test(p)) tags.add('Cultura / Arte / Música');
  if (/esporte|futebol|futsal|natacao|ciclismo|academia|poliesportivo|ginasio|piscina|parque/i.test(p)) {
    tags.add('Esporte e Qualidade de Vida');
  }
  if (/saude|ubs|upa|caps|hospital|psicossocial|mental|dependencia/i.test(p)) {
    tags.add('Saúde / Atenção Psicossocial');
  }
  if (/protecao|cras|creas|abrigo|acolhimento|vulnerabilidade|idoso|gestante|familia/i.test(p)) {
    tags.add('Assistência Social / Proteção');
  }

  if (tags.size === 0 && publico) {
    tags.add('Atendimento Geral');
  }
  return Array.from(tags);
}

function parseNumericField(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseCoord(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
}

function pickField(row: RawRow, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const normCand = normalizeTextKey(cand);
    const matchKey = keys.find((k) => normalizeTextKey(k) === normCand);
    if (matchKey && row[matchKey]) return cleanStr(row[matchKey]);
  }
  return '';
}

function preprocessCsvText(csvText: string): { cleanCsv: string; extractedDate: string } {
  const lines = csvText.split(/\r?\n/);
  let extractedDate = '';
  let startIdx = 0;

  if (lines.length > 1) {
    const firstLine = lines[0] || '';
    const secondLine = lines[1] || '';
    // Handle title banner row on line 1 (e.g., "Mapeamento de Rede - Equipe Psicossocial,Data de atualização :,16/11/2026 10:44:11,,,,,")
    if (
      /mapeamento de rede/i.test(firstLine) ||
      /data de atualiza/i.test(firstLine) ||
      (/categoria/i.test(secondLine) && /institui/i.test(secondLine))
    ) {
      const dateMatch = firstLine.match(/\d{2}\/\d{2}\/\d{4}(?:\s+\d{2}:\d{2}(?::\d{2})?)?/);
      if (dateMatch) extractedDate = dateMatch[0];
      startIdx = 1;
    }
  }

  return {
    cleanCsv: lines.slice(startIdx).join('\n'),
    extractedDate,
  };
}

export function coerceGoogleSheetInput(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return trimmed;
  }
  if (/^docs\.google\.com\/spreadsheets\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  if (/^[a-zA-Z0-9_-]{20,}(?:[?#&]gid=\d+)?$/.test(trimmed) && !trimmed.includes('/')) {
    const [idPart, rest] = trimmed.split(/[?#&]/);
    const gid = rest ? `#${rest}` : '';
    return `https://docs.google.com/spreadsheets/d/${idPart}/edit${gid}`;
  }
  return trimmed;
}

export function normalizeGoogleSheetCsvUrl(rawUrl: string): string {
  const url = coerceGoogleSheetInput(rawUrl);
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  const pubMatch = url.match(/https:\/\/docs\.google\.com\/spreadsheets\/(?:u\/\d+\/)?d\/e\/([a-zA-Z0-9_-]+)/);
  if (pubMatch) {
    const gidMatch = url.match(/[?#&]gid=(\d+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}&single=true` : '';
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv${gidParam}`;
  }
  if (url.includes('/export') || url.includes('output=csv') || url.includes('gviz/tq')) {
    return url;
  }
  const match = url.match(/https:\/\/docs\.google\.com\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    const sheetId = match[1];
    const gidMatch = url.match(/[?#&]gid=(\d+)/);
    const gid = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid}`;
  }
  return url;
}

export async function fetchServerDefaultSources(): Promise<CsvSourceConfig> {
  try {
    const res = await fetch('/api/default-sources', { cache: 'no-store' });
    if (!res.ok) return { unitsUrl: '', mappingUrl: '' };
    const data = (await res.json()) as Partial<CsvSourceConfig>;
    return {
      unitsUrl: typeof data.unitsUrl === 'string' ? data.unitsUrl.trim() : '',
      mappingUrl: typeof data.mappingUrl === 'string' ? data.mappingUrl.trim() : '',
    };
  } catch {
    return { unitsUrl: '', mappingUrl: '' };
  }
}

export async function saveServerDefaultSources(mappingUrl: string): Promise<void> {
  try {
    await fetch('/api/default-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mappingUrl: coerceGoogleSheetInput(mappingUrl) }),
    });
  } catch {
    // Ignore if backend persistence is unavailable
  }
}

async function fetchCsvText(url: string): Promise<string> {
  const trimmed = coerceGoogleSheetInput(url);
  const isGoogleSheets = /^https:\/\/docs\.google\.com\/spreadsheets\//i.test(trimmed);

  if (isGoogleSheets) {
    const proxyRes = await fetch(`/api/sheets-csv?url=${encodeURIComponent(trimmed)}`, {
      cache: 'no-store',
    });

    if (proxyRes.ok) {
      return await proxyRes.text();
    }

    if (proxyRes.status !== 404) {
      let errMessage = `Falha ao acessar Google Sheets (${proxyRes.status})`;
      try {
        const body = (await proxyRes.json()) as { error?: string };
        if (body.error) errMessage = body.error;
      } catch {
        // Ignore JSON parse failure
      }
      throw new Error(errMessage);
    }
  }

  const targetUrl = normalizeGoogleSheetCsvUrl(trimmed);
  const res = await fetch(targetUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Falha ao carregar CSV (${res.status} ${res.statusText})`);
  }
  const text = await res.text();
  if (/^\s*(<!doctype html|<html)/i.test(text)) {
    throw new Error(
      'O link retornou uma página HTML em vez de CSV. Verifique se a planilha está publicada na web como CSV ou compartilhada com acesso público.'
    );
  }
  return text;
}

function parseCsvWithPapa(csvText: string): RawRow[] {
  const result = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });
  return result.data || [];
}

export async function loadNetworkDataset(config: CsvSourceConfig): Promise<{
  units: NetworkUnit[];
  meta: DatasetMeta;
}> {
  const unitsUrl = config.unitsUrl.trim();
  const mappingUrl = config.mappingUrl.trim();

  let mappingText = '';
  let unitsText = '';
  let sourceLabel = 'Base Mapeamento de Rede Psicossocial (Local)';

  if (mappingUrl && unitsUrl) {
    [unitsText, mappingText] = await Promise.all([fetchCsvText(unitsUrl), fetchCsvText(mappingUrl)]);
    sourceLabel = 'Google Sheets ao vivo (Unidades + Mapeamento)';
  } else if (mappingUrl) {
    mappingText = await fetchCsvText(mappingUrl);
    sourceLabel = 'Google Sheets ao vivo (Mapeamento / Atendimentos)';
  } else if (unitsUrl) {
    unitsText = await fetchCsvText(unitsUrl);
    sourceLabel = 'Google Sheets ao vivo (Tabela de Unidades)';
  } else {
    mappingText = await fetchCsvText(DEFAULT_LOCAL_CSV_URL);
  }

  let extractedDate = '';
  const allRawRows: RawRow[] = [];

  if (unitsText) {
    const prep = preprocessCsvText(unitsText);
    if (prep.extractedDate) extractedDate = prep.extractedDate;
    allRawRows.push(...parseCsvWithPapa(prep.cleanCsv));
  }

  if (mappingText) {
    const prep = preprocessCsvText(mappingText);
    if (prep.extractedDate && !extractedDate) extractedDate = prep.extractedDate;
    allRawRows.push(...parseCsvWithPapa(prep.cleanCsv));
  }

  const units: NetworkUnit[] = [];
  let skippedEmptyRows = 0;
  let hasNumericAtendimentos = false;

  allRawRows.forEach((row, index) => {
    const nome = pickField(row, ['Instituição', 'Instituicao', 'Unidade', 'Nome', 'Nome da Unidade', 'Equipamento']);
    const categoriaRaw = pickField(row, ['Categoria', 'Tipo', 'Tipo de Unidade', 'Segmento']);
    const endereco = pickField(row, ['Endereço', 'Endereco', 'Logradouro', 'Localização']);
    const bairroRaw = pickField(row, ['Bairro', 'Distrito']);
    const telefone = pickField(row, ['Telefone', 'Contato', 'Fone']);
    const publicoObjetivo = pickField(row, [
      'Público/Objetivo',
      'Publico/Objetivo',
      'Cursos',
      'Cursos/Oficinas',
      'Oficinas',
      'Objetivo',
      'Descrição',
    ]);
    const referenciaRaw = pickField(row, ['Unidade Referencia', 'Unidade de Referência', 'Referencia', 'Unidade FUNDHAS']);
    const responsavelField = pickField(row, ['Responsável', 'Responsavel', 'Coordenador', 'Gestor']);
    const regiaoRaw = pickField(row, ['Região', 'Regiao', 'Zona']);
    const atendidosVal = parseNumericField(
      pickField(row, ['Atendidos', 'Total Atendidos', 'Vagas', 'Atendimentos', 'Matriculas', 'Alunos'])
    );
    const vagasVal = parseNumericField(pickField(row, ['Vagas', 'Capacidade', 'Vagas Totais']));
    const csvLat = parseCoord(pickField(row, ['Latitude', 'Lat']));
    const csvLng = parseCoord(pickField(row, ['Longitude', 'Lng', 'Lon', 'Long']));

    if (!nome && !endereco && !categoriaRaw) {
      skippedEmptyRows++;
      return;
    }

    if (!nome) {
      skippedEmptyRows++;
      return;
    }

    const categoria = normalizeCategoria(categoriaRaw);
    const isFundhas = isFundhasCategoria(categoria);
    const macroTipo = classifyMacroTipo(categoria, nome);
    const bairro = bairroRaw || 'Não informado';
    const regiao = normalizeRegiao(regiaoRaw, bairro);
    const unidadeReferencia = normalizeReferencia(referenciaRaw);
    const responsavel = responsavelField || unidadeReferencia;
    const isSigiloso = /sem divulga[cç][aã]o|sigilosa|protegida/i.test(`${nome} ${endereco}`);

    if (atendidosVal !== null || vagasVal !== null) {
      hasNumericAtendimentos = true;
    }

    const coords = resolveUnitCoordinates({
      nome,
      endereco,
      bairro,
      regiao,
      isFundhas,
      csvLat,
      csvLng,
    });

    units.push({
      id: `unit-${index}`,
      nome,
      categoriaOriginal: categoria,
      macroTipo,
      isFundhas,
      endereco: endereco || 'Endereço não informado',
      bairro,
      regiao,
      telefone: telefone || 'Não informado',
      publicoObjetivo: publicoObjetivo || 'Informação não especificada',
      cursosTags: extractCursosTags(publicoObjetivo, categoria),
      unidadeReferencia,
      responsavel,
      atendidos: atendidosVal,
      vagas: vagasVal,
      lat: coords.lat,
      lng: coords.lng,
      geocodeSource: coords.geocodeSource,
      isSigiloso,
    });
  });

  return {
    units,
    meta: {
      dataAtualizacao: extractedDate || new Date().toLocaleDateString('pt-BR'),
      sourceLabel,
      hasNumericAtendimentos,
      totalRowsRaw: allRawRows.length,
      skippedEmptyRows,
      unitsUrlUsed: unitsUrl,
      mappingUrlUsed: mappingUrl,
    },
  };
}

export function parseUploadedCsvFile(file: File): Promise<{ units: NetworkUnit[]; meta: DatasetMeta }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result || '');
        const prep = preprocessCsvText(text);
        const rows = parseCsvWithPapa(prep.cleanCsv);
        const blobUrl = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8;' }));
        try {
          const result = await loadNetworkDataset({ unitsUrl: '', mappingUrl: blobUrl });
          result.meta.sourceLabel = `Arquivo CSV (${file.name})`;
          if (prep.extractedDate) result.meta.dataAtualizacao = prep.extractedDate;
          result.meta.totalRowsRaw = rows.length;
          resolve(result);
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo CSV selecionado.'));
    reader.readAsText(file, 'UTF-8');
  });
}

export function exportUnitsToCsv(units: NetworkUnit[]): void {
  const rows = units.map((u) => ({
    Tipo: u.macroTipo,
    Categoria: u.categoriaOriginal,
    Instituicao: u.nome,
    Endereco: u.endereco,
    Bairro: u.bairro,
    Regiao: u.regiao,
    Telefone: u.telefone,
    Unidade_Referencia: u.unidadeReferencia,
    Publico_Objetivo_Cursos: u.publicoObjetivo,
    Atendidos: u.atendidos ?? '',
    Vagas: u.vagas ?? '',
    Latitude: u.lat.toFixed(6),
    Longitude: u.lng.toFixed(6),
  }));

  const csv = Papa.unparse(rows, { delimiter: ',' });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rede-atendimento-fundhas-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
