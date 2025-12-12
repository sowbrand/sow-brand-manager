export type ViewState = 'login' | 'hub' | 'techpack' | 'quote';

export interface PrintLocation {
  name: string;
  art: string;
  dimension: string;
  position: string;
  pantone: string;
  technique: string;
}

export interface TechPackData {
  reference: string;
  collection: string;
  product: string;
  responsible: string;
  date: string;
  
  technicalDrawing: string | null;
  
  // New Strict Technical Fields (Replaces old objects)
  sewingMachine: string;
  needleThread: string;
  looperThread: string;
  hemSize: string;
  sleeveHem: string;
  collarMaterial: string;
  collarHeight: string;
  reinforcement: string;

  obsCostura: string;

  fabric: string;
  imageFront: string | null;
  imageBack: string | null;

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
  service: string;
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