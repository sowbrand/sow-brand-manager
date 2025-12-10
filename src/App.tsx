import React, { useState, useRef, useEffect } from 'react';
import { FileText, Calculator, ArrowLeft, Printer, Save, RefreshCw, Check, Plus, Trash2 } from 'lucide-react';

// --- 1. CONFIGURAÇÕES E DADOS (CONSTANTS) ---
const COMPANY_INFO = {
  name: 'Sow Brand',
  cnpj: '26.224.938/0001-89',
  contact: '(47) 99197-6744 | https://www.sowbrandbrasil.com.br/',
  address: 'Rua Fermino Görl, 115, Reta, São Francisco do Sul - SC, 89333-558'
};

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

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const formatDate = (date: Date) => new Intl.DateTimeFormat('pt-BR').format(date);

// --- 2. COMPONENTES UI REUTILIZÁVEIS ---
const SowCheckbox: React.FC<{ label: string; checked: boolean; onChange: (c: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <div className="relative w-4 h-4 border border-black bg-white flex items-center justify-center" onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
      {checked && <Check size={14} className="text-[#72bf03] stroke-[4]" />}
    </div>
    <span className="text-xs group-hover:text-[#72bf03] select-none">{label}</span>
  </label>
);

const SowInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`w-full bg-transparent text-black outline-none px-1 font-sans placeholder-gray-300 focus:placeholder-gray-400 print:placeholder-transparent print:bg-transparent print:border-none ${props.className || ''}`} />
);

const SowSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
  <div className="relative w-full">
    <select {...props} className={`w-full bg-transparent text-black outline-none border-b border-gray-300 focus:border-[#72bf03] print:border-none appearance-none py-1 pr-4 ${className}`}>{children}</select>
  </div>
);

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`font-bold text-2xl tracking-tighter text-black flex items-center gap-1 ${className}`}>
    <span>SOW</span><span className="text-[#72bf03]">BRAND</span>
  </div>
);

// --- 3. MÓDULO: FICHA TÉCNICA ---
const TRIM_ITEMS = [
  { key: 'linhaPesponto', label: 'Linha Pesponto' }, { key: 'fioOverloque', label: 'Fio Overloque' },
  { key: 'etiquetaMarca', label: 'Etiqueta Marca' }, { key: 'etiquetaComp', label: 'Etiqueta Comp.' },
  { key: 'cadarcoLimpeza', label: 'Cadarço Limpeza' }
];

const TechPackGenerator = () => {
  const [data, setData] = useState({
    reference: '', collection: '', product: '', responsible: '', date: new Date().toISOString().split('T')[0],
    technicalDrawing: null as string | null,
    machines: { overloque: false, reta: false, galoneira: false },
    finishes: { gola: '', limpeza: '', bainhas: '' },
    trims: { linhaPesponto: { used: true, desc: '' }, fioOverloque: { used: true, desc: '' }, etiquetaMarca: { used: false, desc: '' }, etiquetaComp: { used: true, desc: '' }, cadarcoLimpeza: { used: true, desc: '' } },
    obsCostura: '', fabric: '', imageFront: null as string | null, imageBack: null as string | null,
    printSpecs: { technique: '', touch: '' },
    printLocations: {
      local1: { name: 'FRENTE (Tórax)', art: '', dimension: '', position: '', pantone: '', technique: '' },
      local2: { name: 'COSTAS (Nuca)', art: '', dimension: '', position: '', pantone: '', technique: '' },
      local3: { name: 'INTERNO', art: '', dimension: '', position: '', pantone: '', technique: '' },
    },
    variants: ''
  });

  const techDrawingRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const updateMachine = (k: string, v: boolean) => setData(p => ({...p, machines: {...p.machines, [k]: v}}));
  const updateFinish = (k: string, v: string) => setData(p => ({...p, finishes: {...p.finishes, [k]: v}}));
  const updateTrim = (k: string, f: string, v: any) => setData(p => ({...p, trims: {...(p.trims as any), [k]: {...(p.trims as any)[k], [f]: v}}}));
  const updatePrintLoc = (k: string, f: string, v: string) => setData(p => ({...p, printLocations: {...(p.printLocations as any), [k]: {...(p.printLocations as any)[k], [f]: v}}}));

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-100 print:bg-white print:block">
      <div className="no-print w-full lg:w-80 bg-white border-r border-gray-300 p-6 flex flex-col gap-4 shadow-lg overflow-y-auto">
        <h2 className="text-xl font-bold text-black">Painel Ficha Técnica</h2>
        <button onClick={() => setTimeout(() => window.print(), 100)} className="w-full py-3 bg-[#72bf03] text-white rounded font-bold flex justify-center gap-2"><Printer size={18} /> Imprimir / PDF</button>
        <div className="border-t pt-4 space-y-2">
           <p className="text-sm font-bold">Imagens</p>
           <button onClick={() => techDrawingRef.current?.click()} className="text-xs bg-blue-50 text-blue-700 p-2 w-full rounded">📸 Desenho Técnico</button>
           <input type="file" ref={techDrawingRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'technicalDrawing')} />
           <button onClick={() => frontRef.current?.click()} className="text-xs bg-blue-50 text-blue-700 p-2 w-full rounded">📸 Mockup Frente</button>
           <input type="file" ref={frontRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageFront')} />
           <button onClick={() => backRef.current?.click()} className="text-xs bg-blue-50 text-blue-700 p-2 w-full rounded">📸 Mockup Costas</button>
           <input type="file" ref={backRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageBack')} />
        </div>
      </div>

      <div className="flex-grow p-8 print:p-0 flex flex-col items-center gap-8">
        {/* PÁGINA 1 */}
        <div className="a4-page bg-white shadow-2xl p-[10mm] border-2 border-transparent print:border-none print:shadow-none">
           <div className="absolute top-[10mm] right-[10mm] w-32 opacity-80 print:opacity-100"><Logo className="w-full" /></div>
           <div className="border border-black mb-1 mt-10">
              <div className="bg-gray-200 border-b border-black p-1 px-2 font-bold text-sm print:bg-gray-200">SOWBRAND SYSTEMS v2.1 | COSTURA & AVIAMENTOS</div>
              <div className="grid grid-cols-12 divide-x divide-black border-b border-black text-xs">
                 <div className="col-span-3 p-1 flex items-center"><span className="font-bold mr-1">REF:</span><SowInput value={data.reference} onChange={e => setData({...data, reference: e.target.value})} placeholder="000" /></div>
                 <div className="col-span-9 p-1 flex items-center"><span className="font-bold mr-1">COLEÇÃO:</span><SowInput value={data.collection} onChange={e => setData({...data, collection: e.target.value})} placeholder="Coleção" /></div>
              </div>
              <div className="border-b border-black text-xs p-1 flex items-center"><span className="font-bold mr-1">PRODUTO:</span><SowInput value={data.product} onChange={e => setData({...data, product: e.target.value})} /></div>
              <div className="grid grid-cols-12 divide-x divide-black text-xs">
                 <div className="col-span-8 p-1 flex items-center"><span className="font-bold mr-1">RESPONSÁVEL:</span><SowInput value={data.responsible} onChange={e => setData({...data, responsible: e.target.value})} /></div>
                 <div className="col-span-4 p-1 flex items-center"><span className="font-bold mr-1">DATA:</span><SowInput type="date" value={data.date} onChange={e => setData({...data, date: e.target.value})} /></div>
              </div>
           </div>
           <div className="border border-black flex-grow mb-1 relative flex flex-col min-h-[400px]">
              <div className="absolute top-0 left-0 bg-gray-200 px-2 py-0.5 text-[10px] font-bold border-r border-b border-black z-10 print:bg-gray-200">DESENHO TÉCNICO</div>
              <div className="flex-grow flex items-center justify-center p-2 overflow-hidden">{data.technicalDrawing && <img src={data.technicalDrawing} className="max-w-full max-h-full object-contain" />}</div>
           </div>
           <div className="h-[280px] flex gap-2 mb-1">
              <div className="w-1/2 flex flex-col border border-black">
                 <div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-xs print:bg-gray-200">MAQUINÁRIO & COSTURA</div>
                 <div className="p-2 border-b border-black flex-grow text-xs space-y-2">
                    <span className="font-bold">MÁQUINAS:</span>
                    <SowCheckbox label="[Overloque 4 Fios]" checked={data.machines.overloque} onChange={(c) => updateMachine('overloque', c)} />
                    <SowCheckbox label="[Reta Industrial]" checked={data.machines.reta} onChange={(c) => updateMachine('reta', c)} />
                    <SowCheckbox label="[Galoneira]" checked={data.machines.galoneira} onChange={(c) => updateMachine('galoneira', c)} />
                 </div>
                 <div className="p-1 text-xs space-y-1">
                    <div className="font-bold bg-gray-100 print:bg-gray-100">ACABAMENTOS</div>
                    <div className="flex items-center gap-1"><span className="font-bold w-14">GOLA:</span><SowInput value={data.finishes.gola} onChange={e => updateFinish('gola', e.target.value)} className="border-b border-dotted" /></div>
                    <div className="flex items-center gap-1"><span className="font-bold w-14">LIMPEZA:</span><SowInput value={data.finishes.limpeza} onChange={e => updateFinish('limpeza', e.target.value)} className="border-b border-dotted" /></div>
                    <div className="flex items-center gap-1"><span className="font-bold w-14">BAINHAS:</span><SowInput value={data.finishes.bainhas} onChange={e => updateFinish('bainhas', e.target.value)} className="border-b border-dotted" /></div>
                 </div>
              </div>
              <div className="w-1/2 border border-black flex flex-col">
                 <div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-xs print:bg-gray-200">AVIAMENTOS</div>
                 <table className="w-full text-xs"><tbody>{TRIM_ITEMS.map((item) => (
                    <tr key={item.key} className="border-b border-black last:border-0 h-8"><td className="pl-2 border-r border-black w-8"><SowCheckbox label="" checked={(data.trims as any)[item.key].used} onChange={(c) => updateTrim(item.key, 'used', c)} /></td><td className="px-1 border-r border-black font-medium w-24">{item.label}</td><td className="px-1"><SowInput value={(data.trims as any)[item.key].desc} onChange={(e) => updateTrim(item.key, 'desc', e.target.value)} placeholder="..." /></td></tr>
                 ))}</tbody></table>
              </div>
           </div>
           <div className="border border-black bg-gray-100 p-1 mt-auto print:bg-gray-100"><div className="text-[10px] font-bold uppercase">OBS. COSTURA</div><textarea value={data.obsCostura} onChange={e => setData({...data, obsCostura: e.target.value})} className="w-full bg-transparent text-xs resize-none h-12 outline-none" /></div>
           <div className="text-right text-[9px] mt-1 font-bold">PÁGINA 1/2</div>
        </div>

        {/* PÁGINA 2 */}
        <div className="a4-page bg-white shadow-2xl p-[10mm] border-2 border-transparent print:border-none print:shadow-none page-break">
           <div className="absolute top-[10mm] right-[10mm] w-32 opacity-80 print:opacity-100"><Logo className="w-full" /></div>
           <div className="border border-black mb-1 mt-10">
              <div className="bg-gray-200 border-b border-black p-1 px-2 font-bold text-sm print:bg-gray-200">SOWBRAND SYSTEMS v2.1 | ESTAMPARIA</div>
              <div className="grid grid-cols-12 divide-x divide-black border-b border-black text-xs">
                 <div className="col-span-3 p-1 flex items-center"><span className="font-bold mr-1">REF:</span><SowInput value={data.reference} readOnly /></div>
                 <div className="col-span-9 p-1 flex items-center"><span className="font-bold mr-1">TECIDO:</span><SowInput value={data.fabric} onChange={e => setData({...data, fabric: e.target.value})} /></div>
              </div>
           </div>
           <div className="flex gap-2 flex-grow">
              <div className="w-[55%] flex flex-col gap-2">
                 <div className="flex-1 border border-black flex flex-col"><div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-xs print:bg-gray-200">FRENTE</div><div className="flex-grow flex items-center justify-center overflow-hidden">{data.imageFront && <img src={data.imageFront} className="object-contain max-h-full" />}</div></div>
                 <div className="flex-1 border border-black flex flex-col"><div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-xs print:bg-gray-200">COSTAS</div><div className="flex-grow flex items-center justify-center overflow-hidden">{data.imageBack && <img src={data.imageBack} className="object-contain max-h-full" />}</div></div>
              </div>
              <div className="w-[45%] border border-black flex flex-col">
                 <div className="bg-yellow-300 border-b border-black p-1 text-center font-bold text-xs uppercase print:bg-yellow-300">&gt;&gt;&gt; FOCO TOTAL: ESTAMPARIA &lt;&lt;&lt;</div>
                 <div className="flex-grow p-2 space-y-4 overflow-hidden">
                    <div className="border border-black text-xs p-1 space-y-1">
                       <div><span className="font-bold">TÉCNICA:</span><SowSelect value={data.printSpecs.technique} onChange={e => setData({...data, printSpecs: {...data.printSpecs, technique: e.target.value}})}><option value="">Select...</option><option value="Silk">Silk Screen</option><option value="DTF">DTF</option><option value="Sublimação">Sublimação</option></SowSelect></div>
                       <div><span className="font-bold">TOQUE:</span><SowSelect value={data.printSpecs.touch} onChange={e => setData({...data, printSpecs: {...data.printSpecs, touch: e.target.value}})}><option value="">Select...</option><option value="Zero">Toque Zero</option><option value="Emborrachado">Emborrachado</option></SowSelect></div>
                    </div>
                    {['local1', 'local2', 'local3'].map((locKey, idx) => {
                       const loc = (data.printLocations as any)[locKey];
                       return <div key={locKey} className="text-xs space-y-1 pb-2 border-b border-dashed border-gray-400 last:border-0">
                          <div className="font-bold flex gap-1">LOCAL {idx+1}: <SowInput value={loc.name} onChange={e => updatePrintLoc(locKey, 'name', e.target.value)} className="font-bold"/></div>
                          <div className="flex gap-1"><span className="font-bold">ARTE:</span><SowInput value={loc.art} onChange={e => updatePrintLoc(locKey, 'art', e.target.value)}/></div>
                          <div className="flex gap-1"><span className="font-bold">DIMENSÃO:</span><SowInput value={loc.dimension} onChange={e => updatePrintLoc(locKey, 'dimension', e.target.value)}/></div>
                          <div className="flex gap-1"><span className="font-bold">CORES:</span><SowInput value={loc.pantone} onChange={e => updatePrintLoc(locKey, 'pantone', e.target.value)}/></div>
                       </div>
                    })}
                    <div className="bg-[#545454] text-white p-1 text-[10px] font-bold text-center print:bg-[#545454]">VARIANTES</div>
                    <textarea value={data.variants} onChange={e => setData({...data, variants: e.target.value})} className="w-full text-xs h-12 border border-black p-1" />
                 </div>
              </div>
           </div>
           <div className="text-right text-[9px] mt-1 font-bold">PÁGINA 2/2</div>
        </div>
      </div>
    </div>
  );
};

// --- 4. MÓDULO: ORÇAMENTO ---
const QuoteGenerator = () => {
  const [data, setData] = useState({
    orderNumber: '001/2025', orderDate: new Date().toISOString(), deliveryDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    clientName: '', clientAddress: '', clientContact: '', items: [] as any[], observations: ''
  });

  const addItem = () => setData(p => ({...p, items: [...p.items, { id: Math.random(), service: '', sku: '', description: '', quantity: 1, unitPrice: 0 }]}));
  const updateItem = (id: number, f: string, v: any) => setData(p => ({...p, items: p.items.map(i => i.id === id ? { ...i, [f]: v, ...(f === 'service' ? { sku: SKU_MAP[v] || '', description: '' } : {}) } : i)}));
  const removeItem = (id: number) => setData(p => ({...p, items: p.items.filter(i => i.id !== id)}));
  const total = data.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);

  return (
    <div className="flex flex-col lg:flex-row h-full print:block">
      <div className="no-print w-full lg:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Orçamento</h2>
        <div className="flex gap-2 mb-4">
           <button onClick={() => setTimeout(() => window.print(), 100)} className="bg-[#72bf03] text-white px-4 py-2 rounded font-bold flex gap-2"><Printer size={16}/> Imprimir</button>
           <button onClick={addItem} className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-bold flex gap-2"><Plus size={16}/> Add Item</button>
        </div>
        <div className="space-y-4">
           <input placeholder="Cliente" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} className="border p-2 w-full rounded" />
           <input placeholder="Contato" value={data.clientContact} onChange={e => setData({...data, clientContact: e.target.value})} className="border p-2 w-full rounded" />
           <textarea placeholder="Observações" value={data.observations} onChange={e => setData({...data, observations: e.target.value})} className="border p-2 w-full rounded h-24" />
           {data.items.map((item, idx) => (
              <div key={item.id} className="bg-gray-50 p-2 rounded border space-y-2">
                 <div className="flex justify-between font-bold text-xs"><span>Item {idx+1}</span><button onClick={() => removeItem(item.id)} className="text-red-500"><Trash2 size={14}/></button></div>
                 <select value={item.service} onChange={e => updateItem(item.id, 'service', e.target.value)} className="w-full border p-1 rounded"><option value="">Serviço...</option>{Object.keys(SKU_MAP).map(k => <option key={k} value={k}>{k}</option>)}</select>
                 {item.service === 'Private Label' ? <select value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full border p-1 rounded"><option value="">Modelo...</option>{PRIVATE_LABEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select> : <input placeholder="Descrição" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full border p-1 rounded" />}
                 <div className="flex gap-2"><input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', +e.target.value)} className="border p-1 w-20 rounded" placeholder="Qtd"/><input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', +e.target.value)} className="border p-1 w-full rounded" placeholder="Preço"/></div>
              </div>
           ))}
        </div>
      </div>
      <div className="flex-grow bg-gray-200 p-8 print:p-0 print:bg-white flex justify-center overflow-auto">
         <div className="a4-page bg-white shadow-lg p-12 print:shadow-none print:p-0 flex flex-col justify-between">
            <div>
               <div className="border-b-2 border-black pb-6 mb-8 flex justify-between">
                  <div><Logo className="w-48 mb-4"/><div className="text-sm space-y-1"><p><b>CNPJ:</b> {COMPANY_INFO.cnpj}</p><p><b>Contato:</b> {COMPANY_INFO.contact}</p></div></div>
                  <div className="text-right"><h1 className="text-3xl font-bold uppercase mb-2">Pedido de Venda</h1><div className="bg-gray-100 px-6 py-2 rounded border text-center"><p className="text-xs uppercase">Nº Pedido</p><p className="text-2xl font-bold">{data.orderNumber}</p></div></div>
               </div>
               <div className="grid grid-cols-2 gap-8 mb-8">
                  <div><h3 className="font-bold uppercase text-xs mb-2 border-b">Cliente</h3><p className="font-bold text-lg">{data.clientName || '---'}</p><p>{data.clientContact}</p></div>
                  <div><h3 className="font-bold uppercase text-xs mb-2 border-b">Datas</h3><div className="flex justify-between text-sm"><span>Emissão:</span><b>{formatDate(new Date(data.orderDate))}</b></div><div className="flex justify-between text-sm"><span>Entrega:</span><b>{formatDate(new Date(data.deliveryDate))}</b></div></div>
               </div>
               <table className="w-full text-sm border-collapse mb-8">
                  <thead><tr className="bg-black text-white uppercase text-[10px]"><th className="py-2 px-3 text-left">SKU</th><th className="py-2 px-3 text-left w-1/2">Descrição</th><th className="py-2 px-3 text-center">Qtd</th><th className="py-2 px-3 text-right">Unit</th><th className="py-2 px-3 text-right">Total</th></tr></thead>
                  <tbody className="divide-y">{data.items.map((item, idx) => <tr key={item.id} className="avoid-break"><td className="p-3 font-mono text-xs">{item.sku}</td><td className="p-3"><b>{item.service}</b><div className="text-xs">{item.description}</div></td><td className="p-3 text-center">{item.quantity}</td><td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td><td className="p-3 text-right font-bold">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>)}</tbody>
                  <tfoot><tr className="border-t-2 border-black"><td colSpan={4} className="p-4 text-right font-bold uppercase">Total</td><td className="p-4 text-right text-xl font-bold text-[#72bf03]">{formatCurrency(total)}</td></tr></tfoot>
               </table>
               {data.observations && <div className="border p-4 rounded bg-gray-50 mb-8"><h3 className="font-bold text-xs uppercase mb-2">Observações</h3><p className="text-sm">{data.observations}</p></div>}
            </div>
            <div className="pt-16 pb-4 flex justify-between gap-8 avoid-break"><div className="w-full text-center border-t border-black pt-2 text-xs font-bold uppercase">{data.clientName || 'Cliente'}</div><div className="w-full text-center border-t border-black pt-2 text-xs font-bold uppercase">Sow Brand Brasil</div></div>
         </div>
      </div>
    </div>
  );
};

// --- 5. APP PRINCIPAL (MENU) ---
function App() {
  const [screen, setScreen] = useState<'hub' | 'tech' | 'quote'>('hub');

  if (screen === 'hub') return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div><h1 className="text-6xl font-bold tracking-tighter">SOW BRAND <span className="text-[#72bf03]">TOOLS</span></h1><p className="text-gray-500 text-lg mt-4">Hub de Ferramentas de Produção e Vendas</p></div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button onClick={() => setScreen('tech')} className="group bg-white border-2 border-black p-8 rounded-xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all text-left"><div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#72bf03] group-hover:text-white"><FileText size={24}/></div><h3 className="text-2xl font-bold mb-2">Ficha Técnica</h3><p className="text-gray-500 text-sm">Gerar documento técnico de costura e estamparia.</p></button>
          <button onClick={() => setScreen('quote')} className="group bg-white border-2 border-black p-8 rounded-xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all text-left"><div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#72bf03] group-hover:text-white"><Calculator size={24}/></div><h3 className="text-2xl font-bold mb-2">Orçamento</h3><p className="text-gray-500 text-sm">Gerar propostas comerciais com SKUs automáticos.</p></button>
        </div>
        <div className="text-xs text-gray-400 mt-12">Copyright © Sow Brand – Todos os direitos reservados.</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 no-print">
        <div className="flex items-center gap-4"><button onClick={() => setScreen('hub')} className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 text-sm font-bold"><ArrowLeft size={20}/> Menu</button><div className="h-6 w-px bg-gray-300 mx-2"></div><span className="font-bold text-lg">{screen === 'tech' ? 'Gerador de Ficha' : 'Gerador de Orçamento'}</span></div>
        <div className="font-bold text-sm text-[#72bf03]">SOW BRAND</div>
      </header>
      <main className="flex-grow overflow-hidden bg-gray-50">{screen === 'tech' ? <TechPackGenerator /> : <QuoteGenerator />}</main>
    </div>
  );
}

export default App;