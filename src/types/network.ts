export type MacroUnitType =
  | 'FUNDHAS'
  | 'Educação'
  | 'Esporte e Lazer'
  | 'Saúde'
  | 'Assistência Social'
  | 'OSC / Parceiras'
  | 'Cultura'
  | 'Serviços / PEV';

export interface NetworkUnit {
  id: string;
  nome: string;
  categoriaOriginal: string;
  macroTipo: MacroUnitType;
  isFundhas: boolean;
  endereco: string;
  bairro: string;
  regiao: string;
  telefone: string;
  publicoObjetivo: string;
  cursosTags: string[];
  unidadeReferencia: string;
  responsavel: string;
  atendidos: number | null;
  vagas: number | null;
  lat: number;
  lng: number;
  geocodeSource: 'csv' | 'unidade_exata' | 'bairro_sjc' | 'centro_sjc';
  isSigiloso: boolean;
}

export interface DatasetMeta {
  dataAtualizacao: string;
  sourceLabel: string;
  hasNumericAtendimentos: boolean;
  totalRowsRaw: number;
  skippedEmptyRows: number;
  unitsUrlUsed: string;
  mappingUrlUsed: string;
}

export interface FilterState {
  regiao: string;
  bairro: string;
  categoria: string;
  macroTipo: string;
  curso: string;
  unidadeReferencia: string;
  onlyFundhas: boolean;
  search: string;
}

export interface CsvSourceConfig {
  unitsUrl: string;
  mappingUrl: string;
}
