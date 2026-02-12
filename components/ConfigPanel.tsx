import React from 'react';
import { Settings, FileText, X, AlertCircle, ArrowRight, Layers, Minimize2, Check } from 'lucide-react';
import { formatBytes } from '../services/pdfService';
import { CompressionLevel } from '../types';

interface ConfigPanelProps {
  files: File[];
  level: CompressionLevel;
  setLevel: (val: CompressionLevel) => void;
  onRemove: (index: number) => void;
  onStart: () => void;
  onAdd: (files: File[]) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  files,
  level,
  setLevel,
  onRemove,
  onStart,
  onAdd
}) => {
  
  const levels: { id: CompressionLevel; title: string; desc: string; icon: React.ReactNode, colorClass: string }[] = [
    {
      id: 'low',
      title: 'Düşük Sıkıştırma',
      desc: 'Yüksek kalite, büyük dosya boyutu.',
      icon: <Layers size={20} />,
      colorClass: 'border-green-500/50 text-green-400 bg-green-900/10 hover:bg-green-900/20'
    },
    {
      id: 'medium',
      title: 'Orta Sıkıştırma',
      desc: 'Dengeli kalite ve boyut. (Önerilen)',
      icon: <Settings size={20} />,
      colorClass: 'border-blue-500/50 text-blue-400 bg-blue-900/10 hover:bg-blue-900/20'
    },
    {
      id: 'high',
      title: 'Yüksek Sıkıştırma',
      desc: 'Düşük kalite, en küçük boyut.',
      icon: <Minimize2 size={20} />,
      colorClass: 'border-orange-500/50 text-orange-400 bg-orange-900/10 hover:bg-orange-900/20'
    }
  ];

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-200 font-semibold flex items-center gap-2">
          <FileText size={20} className="text-blue-500" />
          Seçilen Dosyalar ({files.length})
        </h3>
        <button onClick={() => document.getElementById('add-more-pdf')?.click()} className="text-xs text-blue-400 hover:text-blue-300">
          + Ekle
        </button>
        <input 
            id="add-more-pdf" 
            type="file" 
            multiple 
            accept="application/pdf" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                 onAdd(Array.from(e.target.files));
                 e.target.value = '';
              }
            }} 
        />
      </div>

      <div className="max-h-60 overflow-y-auto pr-2 space-y-2 mb-6 custom-scrollbar">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-red-900/30 p-2 rounded-lg text-red-400 shrink-0 border border-red-900/20">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-300 truncate w-40">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => onRemove(idx)}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mb-8 border-t border-slate-800 pt-6">
        <label className="flex items-center gap-2 font-semibold text-slate-300 mb-4">
          <Settings size={18} /> Sıkıştırma Seviyesi
        </label>

        <div className="grid grid-cols-1 gap-3">
          {levels.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLevel(opt.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${level === opt.id 
                  ? `${opt.colorClass} shadow-lg shadow-black/20` 
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${level === opt.id ? '' : 'text-slate-500'}`}>
                  {opt.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{opt.title}</h4>
                  <p className="text-xs opacity-80">{opt.desc}</p>
                </div>
                {level === opt.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check size={20} strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 bg-blue-900/20 text-blue-300 text-xs p-3 rounded-lg flex gap-2 items-start border border-blue-800/50">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>
            <strong>Bilgi:</strong> "Yüksek Sıkıştırma" dosya boyutunu en aza indirir ancak görüntü kalitesini düşürebilir. Önemli belgeler için "Orta" veya "Düşük" seviyeyi öneririz.
          </span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
      >
        PDF'leri Sıkıştır ({files.length}) <ArrowRight size={20} />
      </button>
    </div>
  );
};