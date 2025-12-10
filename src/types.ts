export type ViewState = 'login' | 'hub' | 'techpack' | 'quote';

export interface PrintLocation {
  name: string;
  art: string;
  dimension: string;
  position: string;
  pantone: string;
  technique: string;
}

export interface TrimItem {
  used: boolean;
  desc: string;
}

export interface TechPackData {
  // Header Geral
  reference: string;
  collection: string;
  product: string;
  responsible: string;
  date: string;
  
  // Página 1 - Costura
  technicalDrawing: string | null; // Base64 image
  
  machines: {
    overloque: boolean;
    reta: boolean;
    galoneira: boolean;
  };

  finishes: {
    gola: string;
    limpeza: string;
    bainhas: string;
  };

  // Tabela de Aviamentos (Linhas fixas conforme layout)
  trims: {
    linhaPesponto: TrimItem;
    fioOverloque: TrimItem;
    etiquetaMarca: TrimItem;
    etiquetaComp: TrimItem;
    cadarcoLimpeza: TrimItem;
  };

  obsCostura: string;

  // Página 2 - Estampa
  fabric: string;
  imageFront: string | null; // Base64 image
  imageBack: string | null;  // Base64 image

  printSpecs: {
    technique: string;
    touch: string;
  };

  printLocations: {
    local1: PrintLocation;
    local2: PrintLocation;
    local3: PrintLocation;
  };

  variants: string;
}

export interface QuoteItem {
  id: string;
  service: string; // 'Desenvolvimento de Marca' | 'Private Label' ...
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteData {
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  clientName: string;
  clientAddress: string;
  clientContact: string;
  items: QuoteItem[];
  observations: string;
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  contact: string;
  address: string;
}