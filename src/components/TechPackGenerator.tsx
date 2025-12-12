import React, { useState, useRef, useEffect } from 'react';
import { Upload, Printer, Save, Trash2, RefreshCw } from 'lucide-react';
import { TechPackData } from '../types';
import { Logo } from './Logo';
import { SowSelect, SowInput } from './UI';

// --- KNOWLEDGE BASE (CONSTANTS) ---
const MACHINERY_OPTIONS = ["Overloque 3 Fios", "Overloque 4 Fios (Ponto Cadeia)", "Reta Industrial", "Galoneira (Fechada)", "Galoneira (Aberta)"];
const THREAD_TYPES = ["100% Poliéster 120 (Padrão)", "Algodão (Para Tingimento)", "Pesponto (Grosso)"];
const LOOPER_THREADS = ["Fio Poliéster", "Fio Helanca (Poliamida/Texturizado)"];
const HEM_SIZES = ["2.0 cm (Padrão)", "2.5 cm (Marca)", "3.0 cm (Street)", "4.0 cm (Oversized)", "Fio a Fio (Estreito)"];
const COLLAR_TYPES = ["Ribana Canelada 1x1", "Ribana Canelada 2x1", "Do Próprio Tecido (Viés)", "Gola Careca", "Gola V"];
const COLLAR_HEIGHTS = ["1.5 cm", "2.0 cm (Padrão)", "2.5 cm", "3.0 cm (High)"];
const REINFORCEMENTS = ["Ombro a Ombro", "Meia Lua (Costas)", "Sem Reforço"];

const INITIAL_DATA: TechPackData = {
  reference: '',
  collection: '',
  product: '',
  responsible: '',
  date: new Date().toISOString().split('T')[0],
  technicalDrawing: null,
  
  // New Fields
  sewingMachine: '',
  needleThread: '',
  looperThread: '',
  hemSize: '',
  sleeveHem: '',
  collarMaterial: '',
  collarHeight: '',
  reinforcement: '',

  obsCostura: '',
  fabric: '',
  imageFront: null,
  imageBack: null,
  printSpecs: { technique: '', touch: '' },
  printLocations: {
    local1: { name: 'FRENTE (Tórax)', art: '', dimension: '', position: '', pantone: '', technique: '' },
    local2: { name: 'COSTAS (Nuca)', art: '', dimension: '', position: '', pantone: '', technique: '' },
    local3: { name: 'INTERNO', art: '', dimension: '', position: '', pantone: '', technique: '' },
  },
  variants: ''
};

export const TechPackGenerator: React.FC = () => {
  const [data, setData] = useState<TechPackData>(INITIAL_DATA);

  // Refs for file inputs
  const techDrawingRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sow_techpack_active_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial data to ensure new fields exist if loading old draft
        setData({ ...INITIAL_DATA, ...parsed });
      } catch (e) {
        console.error("Erro ao carregar rascunho");
      }
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem('sow_techpack_active_draft', JSON.stringify(data));
  }, [data]);

  const handleNew = () => {
    if (confirm("Tem certeza? Isso apagará todos os dados preenchidos da ficha atual.")) {
      setData(INITIAL_DATA);
      localStorage.removeItem('sow_techpack_active_draft');
    }
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'technicalDrawing' | 'imageFront' | 'imageBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePrintLoc = (key: keyof typeof data.printLocations, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      printLocations: {
        ...prev.printLocations,
        [key]: { ...prev.printLocations[key], [field]: value }
      }
    }));
  };

  // Helper styles
  const inputClass = "";
  const pageClass = "a4-page bg-white shadow-2xl p-[10mm] text-black border-2 border-transparent relative flex flex-col mx-auto mb-8 print:shadow-none print:mb-0 print:border-none print:mx-0";

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-100 print:bg-white print:block">
      
      {/* --- SIDEBAR CONTROLS (No Print) --- */}
      <div className="no-print w-full lg:w-80 bg-white border-r border-gray-300 p-6 flex flex-col gap-6 shadow-lg z-10 h-auto lg:h-[calc(100vh-64px)] overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold text-sow-black mb-2">Painel de Controle</h2>
          <p className="text-sm text-gray-500">Preencha as especificações técnicas.</p>
        </div>

        <div className="space-y-6">
            {/* GROUP 1 */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-sow-green uppercase border-b border-gray-200 pb-1">1. Máquinas & Fios</h3>
                
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Máquina Principal</label>
                    <SowSelect value={data.sewingMachine} onChange={e => setData({...data, sewingMachine: e.target.value})}>
                        <option value="">Selecione...</option>
                        {MACHINERY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Fio da Agulha</label>
                    <SowSelect value={data.needleThread} onChange={e => setData({...data, needleThread: e.target.value})}>
                        <option value="">Selecione...</option>
                        {THREAD_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Fio do Looper</label>
                    <SowSelect value={data.looperThread} onChange={e => setData({...data, looperThread: e.target.value})}>
                        <option value="">Selecione...</option>
                        {LOOPER_THREADS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>
            </div>

            {/* GROUP 2 */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-sow-green uppercase border-b border-gray-200 pb-1">2. Acabamentos (Barras)</h3>
                
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Barra (Corpo)</label>
                    <SowSelect value={data.hemSize} onChange={e => setData({...data, hemSize: e.target.value})}>
                        <option value="">Selecione...</option>
                        {HEM_SIZES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Barra (Manga)</label>
                    <SowSelect value={data.sleeveHem} onChange={e => setData({...data, sleeveHem: e.target.value})}>
                        <option value="">Selecione...</option>
                        {HEM_SIZES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>
            </div>

            {/* GROUP 3 */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-sow-green uppercase border-b border-gray-200 pb-1">3. Gola & Reforços</h3>
                
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Material da Gola</label>
                    <SowSelect value={data.collarMaterial} onChange={e => setData({...data, collarMaterial: e.target.value})}>
                        <option value="">Selecione...</option>
                        {COLLAR_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Altura da Gola</label>
                    <SowSelect value={data.collarHeight} onChange={e => setData({...data, collarHeight: e.target.value})}>
                        <option value="">Selecione...</option>
                        {COLLAR_HEIGHTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">Tipo de Reforço</label>
                    <SowSelect value={data.reinforcement} onChange={e => setData({...data, reinforcement: e.target.value})}>
                        <option value="">Selecione...</option>
                        {REINFORCEMENTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </SowSelect>
                </div>
            </div>
        </div>

        <div className="border-t pt-4 flex flex-col gap-3">
          <button 
            onClick={handleNew}
            className="w-full py-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> Nova Ficha
          </button>
          
          <button 
            onClick={() => localStorage.setItem('sow_techpack_active_draft', JSON.stringify(data))}
            className="w-full py-3 bg-gray-100 text-sow-dark border border-gray-200 hover:bg-gray-200 rounded font-bold flex items-center justify-center gap-2"
          >
            <Save size={18} /> Salvar
          </button>

          <button 
            onClick={handlePrint}
            className="w-full py-3 bg-sow-green text-white hover:bg-[#65a803] rounded font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer size={18} /> Imprimir
          </button>
        </div>

        <div className="mt-4 border-t pt-4">
            <h3 className="font-bold text-sm mb-2">Uploads</h3>
            <div className="space-y-2">
                <button onClick={() => techDrawingRef.current?.click()} className="text-xs bg-blue-50 text-blue-700 p-2 w-full text-left rounded hover:bg-blue-100">
                    📸 Add Desenho Técnico (Pág 1)
                </button>
                <input type="file" ref={techDrawingRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'technicalDrawing')} />

                <button onClick={() => frontRef.current?.click()} className="text-xs bg-blue-50 text-blue-700 p-2 w-full text-left rounded hover:bg-blue-100">
                    📸 Add Mockup Frente (Pág 2)
                </button>
                <input type="file" ref={frontRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageFront')} />
                
                <button onClick={() => backRef.current?.click()} className="text-xs bg-blue-50 text-blue-700 p-2 w-full text-left rounded hover:bg-blue-100">
                    📸 Add Mockup Costas (Pág 2)
                </button>
                <input type="file" ref={backRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageBack')} />
            </div>
        </div>
      </div>

      {/* --- PRINT PREVIEW AREA --- */}
      <div className="flex-grow overflow-auto p-4 lg:p-8 flex flex-col items-center gap-8 print:p-0 print:gap-0 print:block">
        
        {/* ================= PAGE 1: COSTURA ================= */}
        <div className={pageClass}>
            
             <div className="absolute top-[10mm] right-[10mm] w-32 opacity-80 print:opacity-100">
                 <Logo className="w-full" />
             </div>

            {/* Page 1 Header */}
            <div className="border border-black mb-1 mt-10">
                <div className="bg-gray-200 border-b border-black p-1 px-2 font-bold text-sm print:bg-gray-200">
                    SOWBRAND SYSTEMS v2.1 | FICHA TÉCNICA: COSTURA & AVIAMENTOS
                </div>
                <div className="grid grid-cols-12 divide-x divide-black border-b border-black text-xs">
                    <div className="col-span-3 p-1 flex items-center">
                        <span className="font-bold mr-1">REF:</span>
                        <SowInput value={data.reference} onChange={e => setData({...data, reference: e.target.value})} placeholder="000" />
                    </div>
                    <div className="col-span-9 p-1 flex items-center">
                        <span className="font-bold mr-1">COLEÇÃO:</span>
                        <SowInput value={data.collection} onChange={e => setData({...data, collection: e.target.value})} placeholder="Nome da Coleção" />
                    </div>
                </div>
                <div className="border-b border-black text-xs p-1 flex items-center">
                    <span className="font-bold mr-1">PRODUTO:</span>
                    <SowInput value={data.product} onChange={e => setData({...data, product: e.target.value})} placeholder="Descrição do Produto" />
                </div>
                <div className="grid grid-cols-12 divide-x divide-black text-xs">
                    <div className="col-span-8 p-1 flex items-center">
                        <span className="font-bold mr-1">RESPONSÁVEL:</span>
                        <SowInput value={data.responsible} onChange={e => setData({...data, responsible: e.target.value})} placeholder="Nome" />
                    </div>
                    <div className="col-span-4 p-1 flex items-center">
                        <span className="font-bold mr-1">DATA:</span>
                        <SowInput type="date" value={data.date} onChange={e => setData({...data, date: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Page 1: Technical Drawing Area */}
            <div className="border border-black flex-grow mb-1 relative flex flex-col min-h-[400px]">
                 <div className="absolute top-0 left-0 bg-gray-200 px-2 py-0.5 text-[10px] font-bold border-r border-b border-black z-10 print:bg-gray-200">
                     DESENHO TÉCNICO (FRENTE / VERSO)
                 </div>
                 <div className="flex-grow flex items-center justify-center p-2 overflow-hidden">
                    {data.technicalDrawing ? (
                        <img src={data.technicalDrawing} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <button onClick={() => techDrawingRef.current?.click()} className="no-print text-gray-300 hover:text-gray-500">
                            + Carregar Desenho Técnico
                        </button>
                    )}
                 </div>
            </div>

            {/* Page 1: New Technical Specs Table */}
            <div className="flex flex-col border border-black mb-1">
                <div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-xs print:bg-gray-200 uppercase">
                    Especificações de Maquinário & Acabamentos
                </div>
                
                {/* Specs Grid */}
                <div className="grid grid-cols-2 text-xs">
                    {/* Left Side - Machines & Thread */}
                    <div className="border-r border-black">
                        <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 last:border-0">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Máquina:</div>
                             <div className="p-1 font-mono">{data.sewingMachine || '---'}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 last:border-0">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Fio Agulha:</div>
                             <div className="p-1 font-mono">{data.needleThread || '---'}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 last:border-0">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Fio Looper:</div>
                             <div className="p-1 font-mono">{data.looperThread || '---'}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Reforço:</div>
                             <div className="p-1 font-mono">{data.reinforcement || '---'}</div>
                        </div>
                    </div>

                    {/* Right Side - Hems & Collars */}
                    <div>
                         <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 last:border-0">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Barra (Corpo):</div>
                             <div className="p-1 font-mono">{data.hemSize || '---'}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 last:border-0">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Barra (Manga):</div>
                             <div className="p-1 font-mono">{data.sleeveHem || '---'}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] border-b border-gray-300 last:border-0">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Material Gola:</div>
                             <div className="p-1 font-mono">{data.collarMaterial || '---'}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                             <div className="p-1 font-bold bg-gray-50 print:bg-gray-50">Altura Gola:</div>
                             <div className="p-1 font-mono">{data.collarHeight || '---'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page 1: Footer */}
            <div className="border border-black bg-gray-100 p-1 mt-auto print:bg-gray-100">
                <div className="text-[10px] font-bold uppercase mb-1">OBS. COSTURA [Campo Aberto]</div>
                <textarea 
                    value={data.obsCostura}
                    onChange={e => setData({...data, obsCostura: e.target.value})}
                    className="w-full bg-transparent text-xs resize-none h-12 outline-none"
                    placeholder="Atenção ao descanso da malha..."
                />
            </div>
            <div className="text-right text-[9px] mt-1 font-bold">SOWBRAND SYS | PÁGINA 1/2 | ESPEC. TÉCNICA COSTURA</div>
        </div>

        {/* ================= PAGE 2: ESTAMPA ================= */}
        <div className={`${pageClass} page-break`}>
            
            {/* Logo Header (Added for consistency) */}
             <div className="absolute top-[10mm] right-[10mm] w-32 opacity-80 print:opacity-100">
                 <Logo className="w-full" />
             </div>

             {/* Page 2 Header */}
             <div className="border border-black mb-1 mt-10">
                <div className="bg-gray-200 border-b border-black p-1 px-2 font-bold text-sm print:bg-gray-200">
                    SOWBRAND SYSTEMS v2.1 | FICHA TÉCNICA: ESPECIFICAÇÕES DE ESTAMPARIA
                </div>
                <div className="grid grid-cols-12 divide-x divide-black border-b border-black text-xs">
                    <div className="col-span-3 p-1 flex items-center">
                        <span className="font-bold mr-1">REF:</span>
                        <SowInput value={data.reference} readOnly />
                    </div>
                    <div className="col-span-9 p-1 flex items-center">
                        <span className="font-bold mr-1">TECIDO PRINCIPAL:</span>
                        <SowInput value={data.fabric} onChange={e => setData({...data, fabric: e.target.value})} placeholder="Ex: Cotton Pima 97%" />
                    </div>
                </div>
            </div>

            {/* Page 2 Columns */}
            <div className="flex gap-2 flex-grow">
                
                {/* LEFT COL: IMAGES */}
                <div className="w-[55%] flex flex-col gap-2">
                    <div className="flex-1 border border-black flex flex-col">
                        <div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-xs uppercase print:bg-gray-200">VISTA FRENTE (Topo)</div>
                        <div className="flex-grow flex items-center justify-center p-2 overflow-hidden relative">
                             {data.imageFront ? (
                                <img src={data.imageFront} className="max-w-full max-h-full object-contain" />
                             ) : (
                                <button onClick={() => frontRef.current?.click()} className="no-print text-gray-300 hover:text-gray-500">+ Frente</button>
                             )}
                        </div>
                    </div>
                    <div className="flex-1 border border-black flex flex-col">
                        <div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-xs uppercase print:bg-gray-200">VISTA COSTAS (Baixo)</div>
                        <div className="flex-grow flex items-center justify-center p-2 overflow-hidden relative">
                            {data.imageBack ? (
                                <img src={data.imageBack} className="max-w-full max-h-full object-contain" />
                             ) : (
                                <button onClick={() => backRef.current?.click()} className="no-print text-gray-300 hover:text-gray-500">+ Costas</button>
                             )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: SPECS */}
                <div className="w-[45%] border border-black flex flex-col">
                    <div className="bg-yellow-300 border-b border-black p-1 text-center font-bold text-xs uppercase tracking-wide print:bg-yellow-300">
                        &gt;&gt;&gt; FOCO TOTAL: ESTAMPARIA & ARTE &lt;&lt;&lt;
                    </div>

                    <div className="flex-grow p-2 space-y-4 overflow-hidden">
                        
                        {/* Main Specs */}
                        <div className="border border-black">
                            <div className="bg-gray-200 border-b border-black p-1 text-center font-bold text-[10px] print:bg-gray-200">ESPECIFICAÇÕES DA ARTE [Sistema]</div>
                            <div className="p-1 text-xs space-y-1">
                                <div>
                                    <span className="font-bold block">TÉCNICA PREDOMINANTE:</span>
                                    <SowSelect value={data.printSpecs.technique} onChange={e => setData({...data, printSpecs: {...data.printSpecs, technique: e.target.value}})}>
                                        <option value="">Selecione...</option>
                                        <option value="Silk Screen Base D'água">Silk Screen Base D'água</option>
                                        <option value="DTF - Direct to Film">DTF - Direct to Film</option>
                                        <option value="Sublimação">Sublimação</option>
                                    </SowSelect>
                                </div>
                                <div>
                                    <span className="font-bold block">TOQUE DESEJADO:</span>
                                    <SowSelect value={data.printSpecs.touch} onChange={e => setData({...data, printSpecs: {...data.printSpecs, touch: e.target.value}})}>
                                        <option value="">Selecione...</option>
                                        <option value="Toque Zero/Macio">Toque Zero/Macio</option>
                                        <option value="Emborrachado">Emborrachado</option>
                                    </SowSelect>
                                </div>
                            </div>
                        </div>

                        {/* Location Blocks */}
                        {['local1', 'local2', 'local3'].map((locKey, idx) => {
                            const loc = (data.printLocations as any)[locKey];
                            return (
                                <div key={locKey} className="text-xs space-y-1 pb-2 border-b border-dashed border-gray-400 last:border-0">
                                    <div className="font-bold flex items-center gap-1">
                                        LOCAL {idx + 1}:
                                        <SowInput value={loc.name} onChange={e => updatePrintLoc(locKey as any, 'name', e.target.value)} className="font-bold" />
                                    </div>
                                    <div className="flex gap-1"><span className="font-bold">ARTE:</span> <SowInput value={loc.art} onChange={e => updatePrintLoc(locKey as any, 'art', e.target.value)} /></div>
                                    <div className="flex gap-1"><span className="font-bold">DIMENSÃO:</span> <SowInput value={loc.dimension} onChange={e => updatePrintLoc(locKey as any, 'dimension', e.target.value)} /></div>
                                    <div className="flex gap-1"><span className="font-bold">POSIÇÃO:</span> <SowInput value={loc.position} onChange={e => updatePrintLoc(locKey as any, 'position', e.target.value)} /></div>
                                    <div className="flex gap-1"><span className="font-bold">CORES:</span> <SowInput value={loc.pantone} onChange={e => updatePrintLoc(locKey as any, 'pantone', e.target.value)} /></div>
                                    <div className="flex gap-1"><span className="font-bold">TÉCNICA:</span> <SowInput value={loc.technique} onChange={e => updatePrintLoc(locKey as any, 'technique', e.target.value)} /></div>
                                </div>
                            );
                        })}

                        {/* Variants */}
                        <div className="bg-sow-dark text-white p-1 text-[10px] text-center font-bold print:bg-gray-800">VARIANTES ATIVAS [Sistema]</div>
                        <textarea 
                            value={data.variants}
                            onChange={e => setData({...data, variants: e.target.value})}
                            className="w-full text-xs h-16 resize-none outline-none border border-black p-1 bg-white text-black"
                            placeholder="V1: Tecido Preto / Estampa Branca..."
                        />
                    </div>
                </div>
            </div>

            <div className="text-right text-[9px] mt-1 font-bold">SOWBRAND SYS | PÁGINA 2/2 | ESPEC. TÉCNICA ESTAMPA</div>
        </div>

      </div>
    </div>
  );
};