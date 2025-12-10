import { CompanyInfo } from './types';

export const COMPANY_INFO: CompanyInfo = {
  name: "Sow Brand",
  cnpj: "26.224.938/0001-89",
  contact: "(47) 99197-6744 | https://www.sowbrandbrasil.com.br/",
  address: "Rua Fermino Görl, 115, Reta, São Francisco do Sul - SC, 89333-558"
};

export const SKU_MAP: Record<string, string> = {
  'Desenvolvimento de Marca': 'DESMAR',
  'Private Label': 'PRILAB',
  'Personalização': 'PER',
  'Consultoria': 'CON',
  'Mentoria': 'MEN',
};

export const PRIVATE_LABEL_OPTIONS = [
  "Camiseta Oversized",
  "Camiseta Streetwear",
  "Camiseta Casual",
  "Camiseta Slim",
  "Camiseta Feminina"
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};