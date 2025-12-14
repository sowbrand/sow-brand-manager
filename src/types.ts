export type ViewState = 'login' | 'hub' | 'techpack' | 'quote';

export interface PrintLocation {
  name: string;
  art: string;
  dimension: string;
  position: string;
  pantone: string;
  technique: string;
}

export interface GridRow {
  id: string;
  color: string;
  sizes: {
    P: number;
    M: number;
    G: number;
    GG: number;
    XG: number;
  };
}

export interface TechPackData {
  // General Info
  reference: string;
  collection: string;
  product: string;
  responsible: string;
  date: string;
  
  // Media
  technicalDrawing: string | null; // Line Art (Page 3)
  imageFront: string | null;       // Mockup (Page 4)
  imageBack: string | null;        // Mockup (Page 4)

  // Production Grid
  productionGrid: GridRow[];
  
  // Cutting Data
  fabric: string; // Main Fabric
  fabricWidth: string;
  fabricYield: string;
  restTime: boolean;

  // Machinery
  machineClosing: string;
  machineHem: string;
  machineReinforcement: string;
  
  // Threads & Hems
  needleThread: string;
  looperThread: string;
  hemSize: string;
  sleeveHem: string; 
  collarMaterial: string;
  collarHeight: string;
  reinforcementType: string; // Renamed from reinforcement

  // Instructions
  obsCostura: string;

  // Print Specs (Silk/Embroidery)
  printSpecs: {
    technique: string;
    touch: string;
  };

  printLocations: {
    local1: PrintLocation;
    local2: PrintLocation;
    local3: PrintLocation;
  };

  // DTF Settings
  dtfTemp: string;
  dtfTime: string;
  dtfPressure: string;
  dtfPeel: string;

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