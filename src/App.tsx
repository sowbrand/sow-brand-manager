import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FileText, Calculator, ArrowLeft, Printer, Save, RefreshCw, Check, Plus, Trash2, Cloud, FolderOpen, Loader2 } from 'lucide-react';

// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://swdmdccdwpddzfesaeux.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZG1kY2Nkd3BkZHpmZXNhZXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDExMjgsImV4cCI6MjA4MDkxNzEyOH0.wjFPo9X8O8oYYtSwW7i6_M4dennk-36rBnNadzaNUb0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DADOS E UTILITÁRIOS ---
const COMPANY_INFO = {
  name: 'Sow Brand',
  cnpj: '26.224.938/0001-89',
  contact: '(47) 99197-6742', // CORREÇÃO: Telefone atualizado
  address: 'Rua Fermino Görl, 115, Reta, São Francisco do Sul - SC'
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
const formatDate = (date: Date | string) => new Intl.DateTimeFormat('pt-BR').format(new Date(date));

// --- COMPONENTES VISUAIS ---
const SowCheckbox: React.FC<{ label: string; checked: boolean; onChange: (c: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-1 cursor-pointer group">
    <div className="relative w-3 h-3 border border-black bg-white flex items-center justify-center" onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
      {checked && <Check size={10} className="text-[#72bf03] stroke-[4]" />}
    </div>
    <span className="text-[10px] group-hover:text-[#72bf03] select-none leading-none">{label}</span>
  </label>
);

const SowInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`w-full bg-transparent text-black outline-none px-1 font-sans placeholder-gray-300 focus:placeholder-gray-400 print:placeholder-transparent print:bg-transparent print:border-none ${props.className || ''}`} />
);

const SowSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
  <div className="relative w-full">
    <select {...props} className={`w-full bg-transparent text-black outline-none border-b border-gray-300 focus:border-[#72bf03] print:border-none appearance-none py-0.5 pr-4 ${className}`}>{children}</select>
  </div>
);

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`font-bold text-xl tracking-tighter text-black flex items-center gap-1 ${className}`}>
    <span>SOW</span><span className="text-[#72bf03]">BRAND</span>
  </div>
);

// --- MODAL ---
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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

// --- FICHA TÉCNICA ---
const TRIM_ITEMS = [
  { key: 'linhaPesponto', label: 'L. Pesponto' }, { key: 'fioOverloque', label: 'Fio Overloque' },
  { key: 'etiquetaMarca', label: 'Etiq. Marca' }, { key: 'etiquetaComp', label: 'Etiq. Comp.' },
  { key: 'cadarcoLimpeza', label: 'Cad. Limpeza' }
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
      local1: { name: 'FRENTE', art: '', dimension: '', position: '', pantone: '', technique: '' },
      local2: { name: 'COSTAS', art: '', dimension: '', position: '', pantone: '', technique: '' },
      local3: { name: 'INTERNO', art: '', dimension: '', position: '', pantone: '', technique: '' },
    },
    variants: ''
  });
  
  const [showLoad, setShowLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const techDrawingRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const handleSaveCloud = async () => {
    if (!data.reference && !data.product) return alert("Preencha Referência ou Produto.");
    setSaving(true);
    const { error } = await supabase.from('documents').insert([{ type: 'techpack', title: `${data.reference} - ${data.product}`, content: data }]);
    setSaving(false);
    if (error) alert('Erro: ' + error.message); else alert('✅ Salvo!');
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>, f: string) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setData(p => ({ ...p, [f]: r.result })); r.readAsDataURL(file); }
  };

  const updateMachine = (k: string, v: boolean) => setData(p => ({...p, machines: {...p.machines, [k]: v}}));
  const updateFinish = (k: string, v: string) => setData(p => ({...p, finishes: {...p.finishes, [k]: v}}));
  const updateTrim = (k: string, f: string, v: any) => setData(p => ({...p, trims: {...(p.trims as any), [k]: {...(p.trims as any)[k], [f]: v}}}));
  const updatePrintLoc = (k: string, f: string, v: string) => setData(p => ({...p, printLocations: {...(p.printLocations as any), [k]: {...(p.printLocations as any)[k], [f]: v}}}));

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-100 print:bg-white print:block">
      {showLoad && <LoadModal type="techpack" onClose={() => setShowLoad(false)} onLoad={(d) => { setData(d); setShowLoad(false); }} />}
      
      {/* SIDEBAR */}
      <div className="no-print w-full lg:w-72 bg-white border-r border-gray-200 p-4 flex flex-col gap-3 h-auto lg:h-[calc(100vh-64px)] overflow-y-auto shadow-sm z-10">
        <h2 className="font-bold text-gray-800">Painel Ficha</h2>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleSaveCloud} disabled={saving} className="py-2 bg-blue-600 text-white rounded font-bold text-xs flex justify-center items-center gap-1 hover:bg-blue-700">{saving ? <Loader2 className="animate-spin" size={14}/> : <Cloud size={14}/>} Salvar</button>
          <button onClick={() => setShowLoad(true)} className="py-2 bg-gray-100 text-gray-700 rounded font-bold text-xs flex justify-center items-center gap-1 hover:bg-gray-200"><FolderOpen size={14}/> Abrir</button>
        </div>
        <button onClick={() => setTimeout(() => window.print(), 100)} className="py-3 bg-[#72bf03] text-white rounded font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#65a803]"><Printer size={16} /> Imprimir PDF</button>
        <div className="border-t pt-3 space-y-2">
           <p className="text-xs font-bold text-gray-500 uppercase">Uploads</p>
           <button onClick={() => techDrawingRef.current?.click()} className="text-xs bg-blue-50 text-blue-600 p-2 w-full rounded text-left hover:bg-blue-100">📸 Desenho Técnico</button>
           <input type="file" ref={techDrawingRef} className="hidden" accept="image/*" onChange={(e) => handleImg(e, 'technicalDrawing')} />
           <button onClick={() => frontRef.current?.click()} className="text-xs bg-blue-50 text-blue-600 p-2 w-full rounded text-left hover:bg-blue-100">📸 Mockup Frente</button>
           <input type="file" ref={frontRef} className="hidden" accept="image/*" onChange={(e) => handleImg(e, 'imageFront')} />
           <button onClick={() => backRef.current?.click()} className="text-xs bg-blue-50 text-blue-600 p-2 w-full rounded text-left hover:bg-blue-100">📸 Mockup Costas</button>
           <input type="file" ref={backRef} className="hidden" accept="image/*" onChange={(e) => handleImg(e, 'imageBack')} />
        </div>
        <button onClick={() => {if(confirm('Limpar?')) setData({ ...data, reference: '' })}} className="text-xs text-red-400 mt-auto pt-4 flex items-center gap-1"><RefreshCw size={10}/> Resetar Ficha</button>
      </div>

      {/* ÁREA DE VISUALIZAÇÃO */}
      <div className="print-container flex-grow p-8 print:p-0 flex flex-col items-center gap-4 bg-gray-100 print:bg-white overflow-auto">
        
        {/* PÁGINA 1 */}
        <div className="a4-page shadow-lg print:shadow-none flex flex-col">
           <div className="absolute top-4 right-8 w-24 opacity-90"><Logo className="w-full" /></div>
           
           <div className="border border-black mt-6 mb-1">
              <div className="bg-gray-200 border-b border-black p-1 px-2 font-bold text-xs print:bg-gray-200">SOWBRAND SYSTEMS v2.1 | COSTURA</div>
              <div className="flex divide-x divide-black border-b border-black text-[10px]">
                 <div className="w-1/4 p-1 flex items-center"><span className="font-bold mr-1">REF:</span><SowInput value={data.reference} onChange={e => setData({...data, reference: e.target.value})} placeholder="000" /></div>
                 <div className="w-3/4 p-1 flex items-center"><span className="font-bold mr-1">COLEÇÃO:</span><SowInput value={data.collection} onChange={e => setData({...data, collection: e.target.value})} /></div>
              </div>
              <div className="border-b border-black text-[10px] p-1 flex items-center"><span className="font-bold mr-1">PRODUTO:</span><SowInput value={data.product} onChange={e => setData({...data, product: e.target.value})} /></div>
              <div className="flex divide-x divide-black text-[10px]">
                 <div className="w-3/4 p-1 flex items-center"><span className="font-bold mr-1">RESP:</span><SowInput value={data.responsible} onChange={e => setData({...data, responsible: e.target.value})} /></div>
                 <div className="w-1/4 p-1 flex items-center"><span className="font-bold mr-1">DATA:</span><SowInput type="date" value={data.date} onChange={e => setData({...data, date: e.target.value})} /></div>
              </div>
           </div>

           {/* Ajustei a altura mínima aqui para evitar estouro */}
           <div className="border border-black flex-grow mb-1 relative flex flex-col min-h-[250px] max-h-[400px]">
              <div className="absolute top-0 left-0 bg-gray-100 px-2 py-0.5 text-[9px] font-bold border-r border-b border-black z-10">DESENHO TÉCNICO</div>
              <div className="flex-grow flex items-center justify-center p-2 overflow-hidden">
                  {data.technicalDrawing ? <img src={data.technicalDrawing} className="max-w-full max-h-full object-contain" /> : <span className="text-gray-200 text-xs">Sem imagem</span>}
              </div>
           </div>

           {/* Info Técnica - Altura Fixa Reduzida */}
           <div className="h-[200px] flex gap-1 mb-1">
              <div className="w-1/2 flex flex-col border border-black">
                 <div className="bg-gray-200 border-b border-black p-0.5 text-center font-bold text-[10px]">MAQUINÁRIO</div>
                 <div className="p-1 border-b border-black flex-grow text-[10px] space-y-1">
                    <SowCheckbox label="Overloque 4 Fios" checked={data.machines.overloque} onChange={(c) => updateMachine('overloque', c)} />
                    <SowCheckbox label="Reta Industrial" checked={data.machines.reta} onChange={(c) => updateMachine('reta', c)} />
                    <SowCheckbox label="Galoneira" checked={data.machines.galoneira} onChange={(c) => updateMachine('galoneira', c)} />
                 </div>
                 <div className="p-1 text-[10px]">
                    <div className="font-bold bg-gray-100 mb-1">ACABAMENTOS</div>
                    <div className="flex items-center gap-1 mb-1"><span className="font-bold w-12">GOLA:</span><SowInput value={data.finishes.gola} onChange={e => updateFinish('gola', e.target.value)} className="border-b border-dotted text-[10px]" /></div>
                    <div className="flex items-center gap-1 mb-1"><span className="font-bold w-12">LIMP:</span><SowInput value={data.finishes.limpeza} onChange={e => updateFinish('limpeza', e.target.value)} className="border-b border-dotted text-[10px]" /></div>
                    <div className="flex items-center gap-1"><span className="font-bold w-12">BAINHA:</span><SowInput value={data.finishes.bainhas} onChange={e => updateFinish('bainhas', e.target.value)} className="border-b border-dotted text-[10px]" /></div>
                 </div>
              </div>
              <div className="w-1/2 border border-black flex flex-col">
                 <div className="bg-gray-200 border-b border-black p-0.5 text-center font-bold text-[10px]">AVIAMENTOS</div>
                 <table className="w-full text-[10px]"><tbody>{TRIM_ITEMS.map((item) => (
                    <tr key={item.key} className="border-b border-black last:border-0 h-6"><td className="pl-1 border-r border-black w-6"><SowCheckbox label="" checked={(data.trims as any)[item.key].used} onChange={(c) => updateTrim(item.key, 'used', c)} /></td><td className="px-1 border-r border-black font-medium w-20 truncate">{item.label}</td><td className="px-1"><SowInput value={(data.trims as any)[item.key].desc} onChange={(e) => updateTrim(item.key, 'desc', e.target.value)} placeholder="-" className="text-[10px]"/></td></tr>
                 ))}</tbody></table>
              </div>
           </div>

           <div className="border border-black bg-gray-50 p-1 mt-auto h-14">
               <div className="text-[9px] font-bold uppercase">OBSERVAÇÕES DE COSTURA</div>
               <textarea value={data.obsCostura} onChange={e => setData({...data, obsCostura: e.target.value})} className="w-full bg-transparent text-[10px] resize-none h-full outline-none leading-tight" />
           </div>
           <div className="text-right text-[8px] mt-1 font-bold">PÁGINA 1/2</div>
        </div>

        {/* PÁGINA 2 */}
        <div className="a4-page shadow-lg print:shadow-none flex flex-col">
           <div className="absolute top-4 right-8 w-24 opacity-90"><Logo className="w-full" /></div>
           
           <div className="border border-black mt-6 mb-1">
              <div className="bg-gray-200 border-b border-black p-1 px-2 font-bold text-xs">SOWBRAND SYSTEMS v2.1 | ESTAMPA</div>
              <div className="flex divide-x divide-black text-[10px]">
                 <div className="w-1/4 p-1 flex items-center"><span className="font-bold mr-1">REF:</span><SowInput value={data.reference} readOnly /></div>
                 <div className="w-3/4 p-1 flex items-center"><span className="font-bold mr-1">TECIDO PRINCIPAL:</span><SowInput value={data.fabric} onChange={e => setData({...data, fabric: e.target.value})} /></div>
              </div>
           </div>

           <div className="flex gap-1 flex-grow overflow-hidden">
              <div className="w-3/5 flex flex-col gap-1">
                 <div className="flex-1 border border-black flex flex-col relative">
                     <div className="bg-gray-100 border-b border-black p-0.5 text-center font-bold text-[9px]">VISTA FRENTE</div>
                     <div className="flex-grow flex items-center justify-center p-1 overflow-hidden">
                        {data.imageFront ? <img src={data.imageFront} className="max-w-full max-h-full object-contain" /> : <span className="text-[9px] text-gray-300">Frente</span>}
                     </div>
                 </div>
                 <div className="flex-1 border border-black flex flex-col relative">
                     <div className="bg-gray-100 border-b border-black p-0.5 text-center font-bold text-[9px]">VISTA COSTAS</div>
                     <div className="flex-grow flex items-center justify-center p-1 overflow-hidden">
                        {data.imageBack ? <img src={data.imageBack} className="max-w-full max-h-full object-contain" /> : <span className="text-[9px] text-gray-300">Costas</span>}
                     </div>
                 </div>
              </div>

              <div className="w-2/5 border border-black flex flex-col">
                 <div className="bg-yellow-300 border-b border-black p-1 text-center font-bold text-[10px] uppercase">&gt;&gt; ESTAMPARIA &lt;&lt;</div>
                 <div className="flex-grow p-1 space-y-2 overflow-hidden flex flex-col">
                    <div className="border border-black text-[9px] p-1 space-y-1 bg-gray-50">
                       <div className="flex items-center"><span className="font-bold w-14">TÉCNICA:</span><SowSelect value={data.printSpecs.technique} onChange={e => setData({...data, printSpecs: {...data.printSpecs, technique: e.target.value}})} className="text-[9px]"><option value="">-</option><option value="Silk">Silk Screen</option><option value="DTF">DTF</option><option value="Subli">Sublimação</option></SowSelect></div>
                       <div className="flex items-center"><span className="font-bold w-14">TOQUE:</span><SowSelect value={data.printSpecs.touch} onChange={e => setData({...data, printSpecs: {...data.printSpecs, touch: e.target.value}})} className="text-[9px]"><option value="">-</option><option value="Zero">Toque Zero</option><option value="Emborrachado">Emborrachado</option></SowSelect></div>
                    </div>
                    <div className="flex-grow space-y-1">
                        {['local1', 'local2', 'local3'].map((locKey, idx) => {
                        const loc = (data.printLocations as any)[locKey];
                        return <div key={locKey} className="text-[9px] space-y-0.5 pb-1 border-b border-dashed border-gray-300 last:border-0">
                            <div className="font-bold flex gap-1 bg-gray-100 px-1">LOCAL {idx+1}: <SowInput value={loc.name} onChange={e => updatePrintLoc(locKey, 'name', e.target.value)} className="font-bold text-[9px]"/></div>
                            <div className="flex gap-1 px-1"><span className="font-bold w-8">Arte:</span><SowInput value={loc.art} onChange={e => updatePrintLoc(locKey, 'art', e.target.value)} className="text-[9px]"/></div>
                            <div className="flex gap-1 px-1"><span className="font-bold w-8">Tam:</span><SowInput value={loc.dimension} onChange={e => updatePrintLoc(locKey, 'dimension', e.target.value)} className="text-[9px]"/></div>
                            <div className="flex gap-1 px-1"><span className="font-bold w-8">Cor:</span><SowInput value={loc.pantone} onChange={e => updatePrintLoc(locKey, 'pantone', e.target.value)} className="text-[9px]"/></div>
                        </div>
                        })}
                    </div>
                    <div className="bg-[#545454] text-white p-0.5 text-[9px] font-bold text-center mt-auto">VARIANTES</div>
                    <textarea value={data.variants} onChange={e => setData({...data, variants: e.target.value})} className="w-full text-[9px] h-16 border border-black p-1 resize-none" />
                 </div>
              </div>
           </div>
           <div className="text-right text-[8px] mt-1 font-bold">PÁGINA 2/2</div>
        </div>
      </div>
    </div>
  );
};

// --- ORÇAMENTO ---
const QuoteGenerator = () => {
  const [data, setData] = useState({
    orderNumber: 'Carregando...', // CORREÇÃO: Placeholder
    orderDate: new Date().toISOString(), 
    deliveryDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    clientName: '', clientAddress: '', clientContact: '', items: [] as any[], observations: ''
  });
  const [showLoad, setShowLoad] = useState(false);
  const [saving, setSaving] = useState(false);

  // CORREÇÃO: Numeração Automática
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