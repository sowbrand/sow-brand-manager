import React, { useState, useEffect } from 'react';
import { FileText, Calculator, ArrowLeft, Printer, Save, Plus, Trash2, Cloud, FolderOpen, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- IMPORTANTE: AQUI ESTÁ A MÁGICA ---
// Estamos puxando a ficha técnica nova que você criou na outra pasta
import { TechPackGenerator } from './components/TechPackGenerator';

// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://swdmdccdwpddzfesaeux.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZG1kY2Nkd3BkZHpmZXNhZXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDExMjgsImV4cCI6MjA4MDkxNzEyOH0.wjFPo9X8O8oYYtSwW7i6_M4dennk-36rBnNadzaNUb0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DADOS E UTILITÁRIOS GERAIS ---
const COMPANY_INFO = {
  name: 'Sow Brand',
  cnpj: '26.224.938/0001-89',
  contact: '(47) 99197-6742',
  address: 'Rua Fermino Görl, 115, Reta, São Francisco do Sul - SC'
};

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const formatDate = (date: Date | string) => new Intl.DateTimeFormat('pt-BR').format(new Date(date));

const SKU_MAP: Record<string, string> = {
  'Desenvolvimento de Marca': 'DESMAR',
  'Private Label': 'PRILAB',
  'Personalização': 'PER',
  'Consultoria': 'CON',
  'Mentoria': 'MEN'
};

const PRIVATE_LABEL_OPTIONS = [
  "Camiseta Oversized", "Camiseta Streetwear", "Camiseta Casual", "Camiseta Slim", "Camiseta Feminina"
];

// --- COMPONENTES VISUAIS BÁSICOS (Para o Orçamento) ---
// (A Ficha Técnica usa os componentes do arquivo UI.tsx, mas o orçamento usa estes locais por enquanto)
const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`font-bold text-xl tracking-tighter text-black flex items-center gap-1 ${className}`}>
    <span>SOW</span><span className="text-[#72bf03]">BRAND</span>
  </div>
);

const LoadModal: React.FC<{ type: string; onClose: () => void; onLoad: (data: any) => void }> = ({ type, onClose, onLoad }) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase.from('documents').select('*').eq('type', type).order('created_at', { ascending: false });
      if (data) setDocs(data);
      setLoading(false);
    };
    fetchDocs();
  }, [type]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
        <h3 className="font-bold text-lg mb-4 flex justify-between">Abrir Arquivo <button onClick={onClose} className="text-red-500 hover:bg-red-50 px-2 rounded">✕</button></h3>
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#72bf03]" /></div> : (
          <div className="space-y-2">
            {docs.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Nenhum arquivo encontrado.</p>}
            {docs.map(doc => (
              <button key={doc.id} onClick={() => onLoad(doc.content)} className="w-full text-left p-3 border rounded hover:bg-[#f0f9eb] hover:border-[#72bf03] flex justify-between items-center group transition-all">
                <div>
                  <div className="font-bold text-sm text-gray-800">{doc.title || 'Sem Título'}</div>
                  <div className="text-xs text-gray-400">{formatDate(doc.created_at)}</div>
                </div>
                <FolderOpen size={18} className="text-[#72bf03] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MÓDULO ORÇAMENTO (Mantido aqui para garantir funcionamento) ---
const QuoteGenerator = () => {
  const [data, setData] = useState({
    orderNumber: 'Carregando...', 
    orderDate: new Date().toISOString(), 
    deliveryDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    clientName: '', clientAddress: '', clientContact: '', items: [] as any[], observations: ''
  });
  const [showLoad, setShowLoad] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrderNumber = async () => {
      const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('type', 'quote');
      const nextNum = (count || 0) + 1;
      const year = new Date().getFullYear();
      setData(prev => ({ ...prev, orderNumber: `${String(nextNum).padStart(3, '0')}/${year}` }));
    };
    fetchOrderNumber();
  }, []);

  const handleSaveCloud = async () => {
    if (!data.clientName) return alert("Preencha Cliente.");
    setSaving(true);
    const { error } = await supabase.from('documents').insert([{ type: 'quote', title: `Orç. ${data.orderNumber} - ${data.clientName}`, content: data }]);
    setSaving(false);
    if (error) alert('Erro: ' + error.message); else alert('✅ Salvo!');
  };

  const addItem = () => setData(p => ({...p, items: [...p.items, { id: Math.random(), service: '', sku: '', description: '', quantity: 1, unitPrice: 0 }]}));
  const updateItem = (id: number, f: string, v: any) => setData(p => ({...p, items: p.items.map(i => i.id === id ? { ...i, [f]: v, ...(f === 'service' ? { sku: SKU_MAP[v] || '', description: '' } : {}) } : i)}));
  const removeItem = (id: number) => setData(p => ({...p, items: p.items.filter(i => i.id !== id)}));
  const total = data.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);

  return (
    <div className="flex flex-col lg:flex-row h-full print:block">
      {showLoad && <LoadModal type="quote" onClose={() => setShowLoad(false)} onLoad={(d) => { setData(d); setShowLoad(false); }} />}

      <div className="no-print w-full lg:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto h-[calc(100vh-64px)] shadow-sm z-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Orçamento</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={handleSaveCloud} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold text-xs flex justify-center items-center gap-1 hover:bg-blue-700">{saving ? <Loader2 className="animate-spin" size={14}/> : <Cloud size={14}/>} Salvar</button>
          <button onClick={() => setShowLoad(true)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded font-bold text-xs flex justify-center items-center gap-1 hover:bg-gray-200"><FolderOpen size={14}/> Abrir</button>
        </div>
        <div className="flex gap-2 mb-4">
           <button onClick={() => setTimeout(() => window.print(), 100)} className="bg-[#72bf03] text-white px-4 py-2 rounded font-bold text-xs flex gap-2 hover:bg-[#65a803]"><Printer size={16}/> Imprimir</button>
           <button onClick={addItem} className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-bold text-xs flex gap-2 hover:bg-blue-100"><Plus size={16}/> Item</button>
        </div>
        <div className="space-y-3">
           <input placeholder="Cliente" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} className="border p-2 w-full rounded text-sm" />
           <input placeholder="Contato" value={data.clientContact} onChange={e => setData({...data, clientContact: e.target.value})} className="border p-2 w-full rounded text-sm" />
           <textarea placeholder="Obs..." value={data.observations} onChange={e => setData({...data, observations: e.target.value})} className="border p-2 w-full rounded h-20 text-sm" />
           {data.items.map((item, idx) => (
              <div key={item.id} className="bg-gray-50 p-2 rounded border space-y-2 relative group">
                 <button onClick={() => removeItem(item.id)} className="absolute top-1 right-1 text-gray-300 hover:text-red-500"><Trash2 size={12}/></button>
                 <div className="text-[10px] font-bold text-gray-400 uppercase">Item {idx+1}</div>
                 <select value={item.service} onChange={e => updateItem(item.id, 'service', e.target.value)} className="w-full border p-1 rounded text-sm"><option value="">Serviço...</option>{Object.keys(SKU_MAP).map(k => <option key={k} value={k}>{k}</option>)}</select>
                 {item.service === 'Private Label' ? <select value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full border p-1 rounded text-sm"><option value="">Modelo...</option>{PRIVATE_LABEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select> : <input placeholder="Descrição" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full border p-1 rounded text-sm" />}
                 <div className="flex gap-2"><input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', +e.target.value)} className="border p-1 w-16 rounded text-sm" placeholder="Qtd"/><input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', +e.target.value)} className="border p-1 w-full rounded text-sm" placeholder="Preço"/></div>
              </div>
           ))}
        </div>
      </div>

      <div className="print-container flex-grow bg-gray-100 p-8 print:p-0 print:bg-white flex justify-center overflow-auto">
         <div className="a4-page shadow-lg print:shadow-none flex flex-col justify-between p-12">
            <div>
               <div className="border-b-2 border-black pb-4 mb-6 flex justify-between">
                  <div><Logo className="w-40 mb-2"/><div className="text-xs space-y-0.5 text-gray-600"><p><b>CNPJ:</b> {COMPANY_INFO.cnpj}</p><p><b>Contato:</b> {COMPANY_INFO.contact}</p></div></div>
                  <div className="text-right"><h1 className="text-2xl font-bold uppercase mb-1">Pedido de Venda</h1><div className="bg-gray-100 px-4 py-1 rounded border text-center inline-block"><p className="text-[10px] uppercase text-gray-500">Nº Pedido</p><p className="text-xl font-bold font-mono">{data.orderNumber}</p></div></div>
               </div>
               <div className="grid grid-cols-2 gap-8 mb-8 border-b border-dotted border-gray-300 pb-6">
                  <div><h3 className="font-bold uppercase text-[10px] text-gray-500 mb-1">Cliente</h3><p className="font-bold text-base">{data.clientName || '---'}</p><p className="text-sm">{data.clientContact}</p></div>
                  <div><h3 className="font-bold uppercase text-[10px] text-gray-500 mb-1">Condições</h3><div className="flex justify-between text-sm"><span>Emissão:</span><b>{formatDate(data.orderDate)}</b></div><div className="flex justify-between text-sm"><span>Entrega:</span><b>{formatDate(data.deliveryDate)}</b></div></div>
               </div>
               <table className="w-full text-sm border-collapse mb-8">
                  <thead><tr className="bg-black text-white uppercase text-[9px]"><th className="py-2 px-2 text-left">SKU</th><th className="py-2 px-2 text-left w-1/2">Descrição</th><th className="py-2 px-2 text-center">Qtd</th><th className="py-2 px-2 text-right">Unit</th><th className="py-2 px-2 text-right">Total</th></tr></thead>
                  <tbody className="divide-y divide-gray-200">{data.items.map((item, idx) => <tr key={item.id} className="avoid-break"><td className="p-2 font-mono text-[10px] text-gray-500">{item.sku}</td><td className="p-2"><b>{item.service}</b><div className="text-[10px] text-gray-600">{item.description}</div></td><td className="p-2 text-center font-bold">{item.quantity}</td><td className="p-2 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td><td className="p-2 text-right font-bold">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>)}</tbody>
                  <tfoot><tr className="border-t-2 border-black bg-gray-50"><td colSpan={4} className="p-3 text-right font-bold uppercase text-xs">Total do Pedido</td><td className="p-3 text-right text-lg font-bold text-[#72bf03]">{formatCurrency(total)}</td></tr></tfoot>
               </table>
               {data.observations && <div className="border p-4 rounded bg-gray-50 mb-8"><h3 className="font-bold text-[10px] uppercase text-gray-500 mb-1">Observações</h3><p className="text-sm">{data.observations}</p></div>}
            </div>
            <div className="pt-12 pb-4 flex justify-between gap-12 avoid-break mt-auto"><div className="w-full text-center border-t border-black pt-2 text-[10px] font-bold uppercase">{data.clientName || 'Assinatura Cliente'}</div><div className="w-full text-center border-t border-black pt-2 text-[10px] font-bold uppercase">Sow Brand Brasil</div></div>
         </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [screen, setScreen] = useState<'hub' | 'tech' | 'quote'>('hub');

  if (screen === 'hub') return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div><h1 className="text-5xl md:text-6xl font-bold tracking-tighter">SOW BRAND <span className="text-[#72bf03]">TOOLS</span></h1><p className="text-gray-500 text-lg mt-4">Hub de Ferramentas de Produção e Vendas</p></div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button onClick={() => setScreen('tech')} className="group bg-white border-2 border-black p-8 rounded-xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all text-left"><div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#72bf03] group-hover:text-white"><FileText size={24}/></div><h3 className="text-2xl font-bold mb-2">Ficha Técnica</h3><p className="text-gray-500 text-sm">Produção, costura e estamparia.</p></button>
          <button onClick={() => setScreen('quote')} className="group bg-white border-2 border-black p-8 rounded-xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all text-left"><div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#72bf03] group-hover:text-white"><Calculator size={24}/></div><h3 className="text-2xl font-bold mb-2">Orçamento</h3><p className="text-gray-500 text-sm">Propostas comerciais automáticas.</p></button>
        </div>
        <div className="text-xs text-gray-400 mt-12">v2.5 (DB Connected) © Sow Brand</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 no-print shadow-sm z-20">
        <div className="flex items-center gap-3"><button onClick={() => setScreen('hub')} className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 text-xs font-bold text-gray-600"><ArrowLeft size={16}/> Voltar</button><div className="h-4 w-px bg-gray-300"></div><span className="font-bold text-sm text-gray-800">{screen === 'tech' ? 'Ficha Técnica' : 'Orçamento'}</span></div>
        <div className="font-bold text-xs text-[#72bf03]">SOW BRAND</div>
      </header>
      <main className="flex-grow overflow-hidden relative">{screen === 'tech' ? <TechPackGenerator /> : <QuoteGenerator />}</main>
    </div>
  );
}

export default App;