export const SJC_CENTER: [number, number] = [-23.2105, -45.8885];

// Exact coordinates for known FUNDHAS units in São José dos Campos
const FUNDHAS_UNIT_COORDS: Array<{ match: RegExp; lat: number; lng: number }> = [
  { match: /alto da ponte|karla pryscila/i, lat: -23.1508, lng: -45.8992 },
  { match: /dom bosco/i, lat: -23.2712, lng: -45.8916 },
  { match: /unidade centro|jorge luiz alegre/i, lat: -23.1823, lng: -45.8861 },
  { match: /dom pedro i|arnoldo roberto/i, lat: -23.2775, lng: -45.9012 },
  { match: /desenvolvimento art[ií]stico|parque industrial|najla jamile|inova[cç][aã]o sul/i, lat: -23.2256, lng: -45.9038 },
  { match: /inova[cç][aã]o eugenio|inova[cç][aã]o eug[eê]nio/i, lat: -23.1516, lng: -45.7885 },
  { match: /eug[eê]nio de melo|edna dos santos/i, lat: -23.1502, lng: -45.7897 },
  { match: /limoeiro/i, lat: -23.2185, lng: -45.9482 },
  { match: /unidade leste|tiyoka hayashi/i, lat: -23.1759, lng: -45.8398 },
  { match: /inova[cç][aã]o norte|bernardo alberto rohde|cin\s*[-–]/i, lat: -23.1494, lng: -45.9056 },
  { match: /campos de s[aã]o jos[eé]/i, lat: -23.2121, lng: -45.8142 },
  { match: /jardim s[aã]o jos[eé] ii/i, lat: -23.1995, lng: -45.8165 },
  { match: /putim|edna lucia/i, lat: -23.2528, lng: -45.8473 },
];

// Coordinates by São José dos Campos neighborhood (normalized lowercase without accents)
const BAIRRO_COORDS: Record<string, [number, number]> = {
  'centro': [-23.1795, -45.8872],
  'jardim bela vista': [-23.1872, -45.8812],
  'jd bela vista': [-23.1872, -45.8812],
  'jardim sao dimas': [-23.1945, -45.8855],
  'jd sao dimas': [-23.1945, -45.8855],
  'vila adyana': [-23.1972, -45.8935],
  'vila ady ana': [-23.1972, -45.8935],
  'vila ema': [-23.2036, -45.8942],
  'jardim esplanada': [-23.1982, -45.9022],
  'jardim esplanada ii': [-23.2015, -45.9058],
  'esplanada': [-23.1982, -45.9022],
  'jardim apollo ii': [-23.2041, -45.9078],
  'jardim maringa': [-23.2008, -45.8981],
  'jardim margareth': [-23.2012, -45.8965],
  'vila betania': [-23.2005, -45.8898],
  'monte castelo': [-23.1778, -45.8758],
  'jardim paulista': [-23.1846, -45.8732],
  'jardim oswaldo cruz': [-23.1942, -45.8772],
  'jardim augusta': [-23.1924, -45.8788],
  'jardim jussara': [-23.1731, -45.8825],
  'jd jussara': [-23.1731, -45.8825],
  'vila maria': [-23.1725, -45.8858],
  'vila piratininga': [-23.1762, -45.8698],
  'vila progresso': [-23.1748, -45.8781],
  'vila santa helena': [-23.1818, -45.8832],
  'vila rubi': [-23.1842, -45.8895],
  'vila icaraí': [-23.1888, -45.8842],
  'vila icarai': [-23.1888, -45.8842],
  'higienopolis': [-23.1864, -45.8831],
  'vila das acacias': [-23.2065, -45.8672],
  'vila sao pedro': [-23.1821, -45.8648],
  'vila letonia': [-23.1882, -45.8695],
  'jardim nova aurora': [-23.1896, -45.8758],
  'jardim nova america': [-23.1885, -45.8768],
  'nova america': [-23.1885, -45.8768],
  'vila terezinha': [-23.1705, -45.8892],
  'vila tesouro': [-23.1786, -45.8472],
  'jardim ismenia': [-23.1822, -45.8548],
  'jd ismenia': [-23.1822, -45.8548],
  'jardim copacabana': [-23.1748, -45.8512],
  'jardim sao jose': [-23.1972, -45.8215],
  'jardim valparaiba': [-23.1868, -45.8398],
  'valparaiba': [-23.1868, -45.8398],
  'jardim boa vista': [-23.1682, -45.8775],
  'jd boa vista': [-23.1682, -45.8775],
  'chacara boa vista': [-23.1645, -45.8762],
  'vila nova conceicao': [-23.1742, -45.8625],
  'jardim renata': [-23.1955, -45.8792],
  'via cambui': [-23.2022, -45.8615],

  // Norte
  'santana': [-23.1632, -45.8935],
  'alto da ponte': [-23.1518, -45.8988],
  'altos de santana': [-23.1408, -45.9052],
  'jd altos de santana': [-23.1408, -45.9052],
  'jardim telespark': [-23.1475, -45.8858],
  'jd telespark': [-23.1475, -45.8858],
  'vila paiva': [-23.1445, -45.8925],
  'altos da vila paiva': [-23.1392, -45.8918],
  'vila cristina': [-23.1512, -45.9045],
  'vila nova cristina': [-23.1492, -45.9055],
  'vila candida': [-23.1578, -45.8952],
  'vila sao geraldo': [-23.1558, -45.8912],
  'vila cesar': [-23.1562, -45.8878],
  'vila dirce': [-23.1545, -45.8862],
  'vila esmeralda': [-23.1592, -45.8975],
  'vila machado': [-23.1552, -45.8832],
  'vila rangel': [-23.1645, -45.8962],
  'vila rossi': [-23.1605, -45.8915],
  'vila sinha': [-23.1488, -45.9102],
  'vl alexandrina': [-23.1618, -45.8958],
  'altos da boa vista': [-23.1355, -45.8995],
  'buquirinha': [-23.1085, -45.9022],
  'altos do buquirinha': [-23.1012, -45.9045],
  'bairro dos freitas': [-23.1185, -45.9325],
  'freitas': [-23.1185, -45.9325],
  'jaguari': [-23.1282, -45.9445],
  'bonsucesso': [-23.0912, -45.8755],
  'jardim guimaraes': [-23.1432, -45.9082],
  'sertaozinho': [-23.1265, -45.8895],
  'aguas de canindu i': [-23.1245, -45.8965],
  'sao francisco xavier': [-22.9125, -45.9572],
  'parque municipal dos passaros': [-22.9135, -45.9555],

  // Sul
  'parque industrial': [-23.2255, -45.9035],
  'pq industrial': [-23.2255, -45.9035],
  'jardim satelite': [-23.2298, -45.8885],
  'jd satelite': [-23.2298, -45.8885],
  'satelite': [-23.2298, -45.8885],
  'bosque dos eucaliptos': [-23.2435, -45.8892],
  'bosque eucaliptos': [-23.2435, -45.8892],
  'altos do bosque': [-23.2485, -45.8825],
  'bosque dos ipes': [-23.2615, -45.8898],
  'campo dos alemaes': [-23.2698, -45.8912],
  'campos dos alemaes': [-23.2698, -45.8912],
  'dom pedro i': [-23.2772, -45.9005],
  'd pedro i': [-23.2772, -45.9005],
  'dom pedro 1o': [-23.2772, -45.9005],
  'conj dom pedro i': [-23.2772, -45.9005],
  'conj hab dom pedro 1o': [-23.2772, -45.9005],
  'conj resi dom pedro i': [-23.2772, -45.9005],
  'dom pedro ii': [-23.2812, -45.8965],
  'dom pedro 2o': [-23.2812, -45.8965],
  'conjunto residencial joao paulo 2o': [-23.2745, -45.8945],
  'papa joao paulo i': [-23.2745, -45.8945],
  'cidade morumbi': [-23.2595, -45.9052],
  'jardim morumbi': [-23.2575, -45.9045],
  'jd morumbi': [-23.2575, -45.9045],
  'morumbi': [-23.2575, -45.9045],
  'jardim america': [-23.2202, -45.8955],
  'jd america': [-23.2202, -45.8955],
  'floradas de sao jose': [-23.2355, -45.8975],
  'jardim oriente': [-23.2422, -45.9068],
  'jd oriente': [-23.2422, -45.9068],
  'jardim vale do sol': [-23.2465, -45.9102],
  'vale do sol': [-23.2465, -45.9102],
  'jardim portugal': [-23.2412, -45.9012],
  'jardim colonial': [-23.2662, -45.8812],
  'colonial': [-23.2662, -45.8812],
  'jardim imperial': [-23.2695, -45.9052],
  'jd imperial': [-23.2695, -45.9052],
  'jardim republica': [-23.2642, -45.9105],
  'residencial uniao': [-23.2672, -45.9135],
  'conj elmano veloso': [-23.2762, -45.8852],
  'conj res elmano veloso': [-23.2762, -45.8852],
  'parque interlagos': [-23.2752, -45.8752],
  'pq interlagos': [-23.2752, -45.8752],
  'interlagos': [-23.2752, -45.8752],
  'chacaras reunidas': [-23.2385, -45.9265],
  'rio comprido': [-23.2448, -45.9322],
  'jardim anhembi': [-23.2535, -45.8712],
  'jd anhembi': [-23.2535, -45.8712],
  'torrao de ouro': [-23.2965, -45.8825],
  'jardim torrao de ouro': [-23.2965, -45.8825],
  'palmeiras de sao jose': [-23.2545, -45.8965],
  'jardim veneza': [-23.2502, -45.9022],
  'jd veneza': [-23.2502, -45.9022],
  'jardim por do sol': [-23.2555, -45.8915],
  'jd por do sol': [-23.2555, -45.8915],
  'jardim estoril': [-23.2255, -45.8955],
  'jardim paraiso': [-23.2582, -45.8982],
  'jardim mesquita': [-23.2612, -45.9012],
  'jd mesquita': [-23.2612, -45.9012],
  'jd cruzeiro do sul': [-23.2742, -45.8798],
  'cruzeiro do sul': [-23.2742, -45.8798],
  'residencial gazzo': [-23.2618, -45.8838],
  'residencial de ville': [-23.2532, -45.8865],
  'cidade jardim': [-23.2372, -45.8865],
  '31 de marco': [-23.2345, -45.8825],
  'conj residencial 31 de marco': [-23.2345, -45.8825],
  'conjunto residencial 31 de marco': [-23.2345, -45.8825],
  'conjunto residencia 31 de marco': [-23.2345, -45.8825],
  'jardim souto': [-23.2185, -45.8825],
  'vila sao bento': [-23.2268, -45.8915],
  'vila sao benedito': [-23.2225, -45.8792],
  'vila nair': [-23.2145, -45.8765],
  'vale dos pinheiros': [-23.2275, -45.9152],
  'jardim colorado': [-23.2185, -45.8712],
  'terras do sul': [-23.2695, -45.8842],
  'recanto do pinheiros': [-23.2545, -45.8625],
  'vila das flores': [-23.2712, -45.8965],
  'jardim santa edwiges': [-23.2648, -45.8965],

  // Leste
  'vila industrial': [-23.1812, -45.8598],
  'vila tatetuba': [-23.1752, -45.8525],
  'residencial tatetuba': [-23.1735, -45.8495],
  'vista verde': [-23.1848, -45.8332],
  'cidade vista verde': [-23.1848, -45.8332],
  'vista verde 2': [-23.1875, -45.8295],
  'vista linda': [-23.1825, -45.8245],
  'jardim motorama': [-23.1802, -45.8285],
  'jardim rodolfo': [-23.1758, -45.8398],
  'jardim diamante': [-23.1772, -45.8425],
  'jardim americano': [-23.1795, -45.8225],
  'jardim pararangaba': [-23.1735, -45.8155],
  'pararangaba': [-23.1735, -45.8155],
  'novo horizonte': [-23.1845, -45.8055],
  'parque novo horizonte': [-23.1845, -45.8055],
  'pq novo horizonte': [-23.1845, -45.8055],
  'parque nova esperanca': [-23.1885, -45.7985],
  'parque boa esperanca': [-23.1885, -45.7985],
  'campos de sao jose': [-23.2122, -45.8142],
  'jardim mariana i': [-23.2045, -45.8045],
  'jardim mariana 1': [-23.2045, -45.8045],
  'jardim mariana ii': [-23.2075, -45.7995],
  'jd mariana ii': [-23.2075, -45.7995],
  'jardim sao jose ii': [-23.1995, -45.8165],
  'jardim sao jose 2': [-23.1995, -45.8165],
  'sao jose 2': [-23.1995, -45.8165],
  'eugenio de melo': [-23.1502, -45.7897],
  'galo branco': [-23.1648, -45.7995],
  'residencial galo branco': [-23.1648, -45.7995],
  'jardim das flores': [-23.1565, -45.7925],
  'jd das flores': [-23.1565, -45.7925],
  'jardim itapua': [-23.1695, -45.8035],
  'jd itapua': [-23.1695, -45.8035],
  'jardim santa ines i': [-23.1795, -45.7955],
  'santa ines i': [-23.1795, -45.7955],
  'jardim santa ines 1': [-23.1795, -45.7955],
  'jardim santa ines ii': [-23.1815, -45.7915],
  'santa ines 2': [-23.1815, -45.7915],
  'jardim santa ines 2': [-23.1815, -45.7915],
  'jardim santa ines iii': [-23.1835, -45.7875],
  'santa ines 3': [-23.1835, -45.7875],
  'jardim castanheira': [-23.1895, -45.8145],
  'jardim castanheiras': [-23.1895, -45.8145],
  'castanheira': [-23.1895, -45.8145],
  'jardim das cerejeiras': [-23.1915, -45.8185],
  'jardim cerejeiras': [-23.1915, -45.8185],
  'jardim nova detroit': [-23.1935, -45.8105],
  'nova detroit': [-23.1935, -45.8105],
  'jardim paraiso do sol': [-23.1955, -45.8045],
  'paraiso do sol': [-23.1955, -45.8045],
  'pousada do vale': [-23.2245, -45.7825],
  'chacara pousada do vale': [-23.2245, -45.7825],
  'chacaras pousada do vale': [-23.2245, -45.7825],
  'setville altos de sao jose': [-23.2145, -45.8025],
  'altos de sao jose': [-23.2145, -45.8025],
  'frei galvao': [-23.1685, -45.8225],
  'residencial frei galvao': [-23.1685, -45.8225],
  'jardim santa herminia': [-23.1695, -45.7825],
  'santa herminia': [-23.1695, -45.7825],
  'majestic': [-23.1735, -45.7785],
  'jardim majestic': [-23.1735, -45.7785],
  'primavera i': [-23.1935, -45.7945],
  'jardim primavera i': [-23.1935, -45.7945],
  'jardim sao vicente': [-23.1765, -45.8095],
  'jardim paineiras ii': [-23.1975, -45.8085],
  'jardim helena': [-23.1875, -45.8195],
  'jardim monterrey': [-23.2085, -45.8195],
  'jd monterrey': [-23.2085, -45.8195],
  'vila monterrey': [-23.2085, -45.8195],
  'res armando moreira righi': [-23.1615, -45.7945],
  'residencial armando moreira righ': [-23.1615, -45.7945],
  'residencial righi': [-23.1615, -45.7945],
  'bom retiro': [-23.1825, -45.7625],
  'cajuru': [-23.2295, -45.7765],
  'chacaras araujo': [-23.2185, -45.7885],
  'coqueiro': [-23.2045, -45.7815],
  'bairrinho': [-23.1965, -45.7745],
  'nova florida': [-23.1865, -45.7935],
  'nova michigan': [-23.1885, -45.7915],
  'residencial integracao': [-23.1835, -45.8555],
  'residencial intervale': [-23.1775, -45.8345],
  'residencial martins pereira': [-23.1815, -45.8385],
  'residencial sol nascente': [-23.1915, -45.7875],

  // Sudeste
  'putim': [-23.2528, -45.8473],
  'jardim da granja': [-23.2265, -45.8625],
  'jd da granja': [-23.2265, -45.8625],
  'parque santa rita': [-23.2405, -45.8565],
  'pq santa rita': [-23.2405, -45.8565],
  'jardim sao judas tadeu': [-23.2435, -45.8515],
  'jd sao judas tadeu': [-23.2435, -45.8515],
  'sao judas tadeu': [-23.2435, -45.8515],
  'jardim santo onofre': [-23.2485, -45.8485],
  'jd santo onofre': [-23.2485, -45.8485],
  'santo onofre': [-23.2485, -45.8485],
  'jardim santa luzia': [-23.2455, -45.8435],
  'jd santa luzia': [-23.2455, -45.8435],
  'santa luzia': [-23.2455, -45.8435],
  'jardim sao leopoldo': [-23.2515, -45.8425],
  'jd sao leopoldo': [-23.2515, -45.8425],
  'jardim uira': [-23.2415, -45.8395],
  'jd uira': [-23.2415, -45.8395],
  'jardim santa fe': [-23.2495, -45.8365],
  'jd santa fe': [-23.2495, -45.8365],
  'vila iracema': [-23.2465, -45.8535],
  'vila adriana': [-23.2555, -45.8515],
  'residencial pinheirinho dos palmares': [-23.2715, -45.8365],
  'residencial pinheirinho ii': [-23.2735, -45.8335],
  'pinheirinho dos palmares': [-23.2715, -45.8365],
  'jardim do lago': [-23.2375, -45.8585],
  'jardim santa julia': [-23.2585, -45.8385],
  'jd santa julia': [-23.2585, -45.8385],
  'santa julia': [-23.2585, -45.8385],
  'juritis': [-23.2625, -45.8425],
  'portal dos passaros': [-23.2545, -45.8445],
  'residencial jatoba': [-23.2605, -45.8485],
  'residencial flamboyant': [-23.2355, -45.8615],
  'residencial sao francisco': [-23.2475, -45.8565],

  // Oeste
  'urbanova': [-23.2045, -45.9515],
  'jardim aquarius': [-23.2185, -45.9085],
  'jardim das colinas': [-23.2035, -45.9145],
  'colinas 1 e 2': [-23.2035, -45.9145],
  'jardim das industrias': [-23.2175, -45.9225],
  'jardim das indústrias': [-23.2175, -45.9225],
  'jd das industrias': [-23.2175, -45.9225],
  'jardim limoeiro': [-23.2185, -45.9482],
  'jd limoeiro': [-23.2185, -45.9482],
  'jardim alvorada': [-23.2215, -45.9325],
  'residencial montserrat': [-23.2095, -45.9345],
};

const REGIAO_COORDS: Record<string, [number, number]> = {
  'Centro': [-23.1865, -45.8865],
  'Norte': [-23.1495, -45.8975],
  'Sul': [-23.2495, -45.8965],
  'Leste': [-23.1845, -45.8215],
  'Sudeste': [-23.2505, -45.8485],
  'Oeste': [-23.2135, -45.9315],
};

export function normalizeTextKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,ºª()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deterministicOffset(seed: string, spreadLat = 0.0032, spreadLng = 0.0038): [number, number] {
  let h1 = 2166136261;
  let h2 = 16777619;
  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 16777619);
    h2 ^= code * (i + 1);
    h2 = Math.imul(h2, 16777619);
  }
  const u1 = ((h1 >>> 0) % 10000) / 10000 - 0.5;
  const u2 = ((h2 >>> 0) % 10000) / 10000 - 0.5;
  return [u1 * spreadLat, u2 * spreadLng];
}

export function resolveUnitCoordinates(params: {
  nome: string;
  endereco: string;
  bairro: string;
  regiao: string;
  isFundhas: boolean;
  csvLat?: number | null;
  csvLng?: number | null;
}): { lat: number; lng: number; geocodeSource: 'csv' | 'unidade_exata' | 'bairro_sjc' | 'centro_sjc' } {
  const { nome, endereco, bairro, regiao, isFundhas, csvLat, csvLng } = params;

  if (
    typeof csvLat === 'number' &&
    typeof csvLng === 'number' &&
    Number.isFinite(csvLat) &&
    Number.isFinite(csvLng) &&
    Math.abs(csvLat) > 1 &&
    Math.abs(csvLng) > 1
  ) {
    return { lat: csvLat, lng: csvLng, geocodeSource: 'csv' };
  }

  if (isFundhas) {
    for (const entry of FUNDHAS_UNIT_COORDS) {
      if (entry.match.test(nome) || entry.match.test(endereco)) {
        const [dLat, dLng] = deterministicOffset(`${nome}|${endereco}`, 0.0005, 0.0005);
        return { lat: entry.lat + dLat, lng: entry.lng + dLng, geocodeSource: 'unidade_exata' };
      }
    }
  }

  const keyBairro = normalizeTextKey(bairro);
  const direct = BAIRRO_COORDS[keyBairro];
  if (direct) {
    const [dLat, dLng] = deterministicOffset(`${nome}|${endereco}|${bairro}`);
    return { lat: direct[0] + dLat, lng: direct[1] + dLng, geocodeSource: 'bairro_sjc' };
  }

  // Partial neighborhood match (e.g., "Altos de Santana (Parque Alberto Simões)")
  for (const [k, coords] of Object.entries(BAIRRO_COORDS)) {
    if (keyBairro && (keyBairro.includes(k) || k.includes(keyBairro))) {
      const [dLat, dLng] = deterministicOffset(`${nome}|${endereco}|${bairro}`);
      return { lat: coords[0] + dLat, lng: coords[1] + dLng, geocodeSource: 'bairro_sjc' };
    }
  }

  const regCoords = REGIAO_COORDS[regiao];
  if (regCoords) {
    const [dLat, dLng] = deterministicOffset(`${nome}|${endereco}|${regiao}`, 0.012, 0.014);
    return { lat: regCoords[0] + dLat, lng: regCoords[1] + dLng, geocodeSource: 'bairro_sjc' };
  }

  const [dLat, dLng] = deterministicOffset(`${nome}|${endereco}`, 0.015, 0.018);
  return { lat: SJC_CENTER[0] + dLat, lng: SJC_CENTER[1] + dLng, geocodeSource: 'centro_sjc' };
}

export async function geocodeAddressNominatim(endereco: string, bairro: string): Promise<[number, number] | null> {
  if (!endereco || /sem divulga[cç][aã]o/i.test(endereco)) return null;
  const query = encodeURIComponent(`${endereco}, ${bairro ? bairro + ', ' : ''}São José dos Campos, SP, Brasil`);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`, {
      headers: { 'Accept-Language': 'pt-BR' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [lat, lng];
      }
    }
    return null;
  } catch {
    return null;
  }
}
