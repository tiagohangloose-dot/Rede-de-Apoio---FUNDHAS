import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.PORT) || 3000;
const CONFIG_FILE = path.resolve(process.cwd(), '.sheet-config.json');
const DEFAULT_GOOGLE_SHEET_MAPPING_URL =
  'https://docs.google.com/spreadsheets/d/1w_5xEL1ARoIFiW8laZSzZOuWEU7vbm8KXoL1QIz0LXs/edit?gid=0';

interface PersistedSheetConfig {
  unitsUrl: string;
  mappingUrl: string;
}

function readPersistedConfig(): PersistedSheetConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistedSheetConfig>;
      return {
        unitsUrl: typeof parsed.unitsUrl === 'string' ? parsed.unitsUrl.trim() : '',
        mappingUrl: typeof parsed.mappingUrl === 'string' ? parsed.mappingUrl.trim() : '',
      };
    }
  } catch {
    // Ignore file read errors
  }
  return { unitsUrl: '', mappingUrl: '' };
}

function writePersistedConfig(cfg: PersistedSheetConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch {
    // Ignore file write errors in read-only runtimes
  }
}

function extractGid(rawUrl: string): string | null {
  const match = rawUrl.match(/[?#&]gid=(\d+)/);
  return match ? match[1] : null;
}

function coerceGoogleSheetUrl(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';
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

function buildGoogleSheetsCsvCandidates(rawUrl: string): string[] | null {
  const coerced = coerceGoogleSheetUrl(rawUrl);
  let parsed: URL;
  try {
    parsed = new URL(coerced);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' || parsed.hostname !== 'docs.google.com') {
    return null;
  }
  if (!parsed.pathname.startsWith('/spreadsheets/')) {
    return null;
  }

  const gid = extractGid(coerced);
  const candidates: string[] = [];

  // Published-to-web URL: /spreadsheets/d/e/2PACX-.../pub or /pubhtml
  const pubMatch = parsed.pathname.match(/^\/spreadsheets\/(?:u\/\d+\/)?d\/e\/([a-zA-Z0-9_-]+)/);
  if (pubMatch) {
    const pubId = pubMatch[1];
    const pubUrl = new URL(`https://docs.google.com/spreadsheets/d/e/${pubId}/pub`);
    pubUrl.searchParams.set('output', 'csv');
    if (gid) pubUrl.searchParams.set('gid', gid);
    if (gid) pubUrl.searchParams.set('single', 'true');
    candidates.push(pubUrl.toString());
    return candidates;
  }

  // Standard spreadsheet URL: /spreadsheets/d/<ID>/...
  const docMatch = parsed.pathname.match(/^\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (!docMatch) {
    return null;
  }

  const sheetId = docMatch[1];
  const gidQuery = gid ? `&gid=${gid}` : '';

  if (parsed.pathname.endsWith('/export') && parsed.searchParams.get('format') === 'csv') {
    candidates.push(coerced);
  }
  candidates.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidQuery}`);
  candidates.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidQuery}`);

  return Array.from(new Set(candidates));
}

function looksLikeHtmlLoginOrError(contentType: string, body: string, finalUrl: string): boolean {
  if (finalUrl.includes('accounts.google.com')) return true;
  if (contentType.toLowerCase().includes('text/html')) return true;
  const trimmed = body.trimStart().toLowerCase();
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/default-sources', (_req, res) => {
    const envMappingUrl = (
      process.env.GOOGLE_SHEET_MAPPING_URL ||
      process.env.VITE_GOOGLE_SHEET_MAPPING_URL ||
      ''
    ).trim();

    const persisted = readPersistedConfig();
    const mappingUrl = envMappingUrl || persisted.mappingUrl || DEFAULT_GOOGLE_SHEET_MAPPING_URL;

    res.setHeader('Cache-Control', 'no-store');
    res.json({ unitsUrl: '', mappingUrl });
  });

  app.post('/api/default-sources', (req, res) => {
    const rawMapping = typeof req.body?.mappingUrl === 'string' ? req.body.mappingUrl.trim() : '';
    const mappingUrl = rawMapping ? coerceGoogleSheetUrl(rawMapping) : '';

    if (mappingUrl && !buildGoogleSheetsCsvCandidates(mappingUrl)) {
      res.status(400).json({
        error: 'URL inválida. Informe um link ou ID válido da planilha do Google Sheets.',
      });
      return;
    }

    const nextCfg: PersistedSheetConfig = { unitsUrl: '', mappingUrl };
    writePersistedConfig(nextCfg);
    res.json(nextCfg);
  });

  app.get('/api/sheets-csv', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const candidates = buildGoogleSheetsCsvCandidates(rawUrl);

    if (!candidates || candidates.length === 0) {
      res.status(400).json({
        error:
          'URL inválida. Informe um link válido do Google Sheets (https://docs.google.com/spreadsheets/d/...).',
      });
      return;
    }

    let lastStatus = 502;
    let sawPrivateSheet = false;

    for (const candidate of candidates) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const sep = candidate.includes('?') ? '&' : '?';
        const upstream = await fetch(`${candidate}${sep}_cb=${Date.now()}`, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'User-Agent': 'FUNDHAS-Network-Dashboard/1.0',
          },
        });
        clearTimeout(timeout);

        lastStatus = upstream.status;
        const contentType = upstream.headers.get('content-type') || '';
        const text = await upstream.text();

        if (!upstream.ok) {
          if (upstream.status === 401 || upstream.status === 403) {
            sawPrivateSheet = true;
          }
          continue;
        }

        if (looksLikeHtmlLoginOrError(contentType, text, upstream.url)) {
          sawPrivateSheet = true;
          continue;
        }

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.status(200).send(text);
        return;
      } catch {
        // Try next candidate URL
      }
    }

    if (sawPrivateSheet) {
      res.status(403).json({
        error:
          'A planilha do Google Sheets está privada. No Google Sheets, clique em Compartilhar > Acesso geral: "Qualquer pessoa com o link (Leitor)" ou em Arquivo > Compartilhar > Publicar na web (.csv).',
      });
      return;
    }

    res.status(lastStatus >= 400 ? lastStatus : 502).json({
      error:
        'Não foi possível baixar o CSV do Google Sheets. Verifique se o link está correto e acessível publicamente.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FUNDHAS Dashboard server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
