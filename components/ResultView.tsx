import React from 'react';
import { CheckCircle, RefreshCw, Download, FileText, ArrowRight } from 'lucide-react';
import { CompressionResult } from '../types';
import { formatBytes } from '../services/pdfService';

interface ResultViewProps {
  results: CompressionResult[];
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ results, onReset }) => {
  
  const handleDownload = (result: CompressionResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimize_${result.fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalOriginal = results.reduce((acc, curr) => acc + curr.originalSizeRaw, 0);
  const totalNew = results.reduce((acc, curr) => acc + curr.newSizeRaw, 0);
  const totalSavings = totalOriginal - totalNew;
  const isOverallGain = totalSavings > 0;

  return (
    <div className="p-8 bg-gradient-to-b from-slate-900 to-green-900/10 animate-in slide-in-from-bottom-8 duration-500 max-h-[80vh] flex flex-col">
      <div className="flex flex-col items-center text-center mb-6 shrink-0">
        <div
          className={`w-14 h-14 ${
            !isOverallGain ? 'bg-orange-900/30 text-orange-500' : 'bg-green-900/30 text-green-500'
          } rounded-full flex items-center justify-center mb-3 shadow-sm border ${!isOverallGain ? 'border-orange-900/50' : 'border-green-900/50'}`}
        >
          <CheckCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-100">İşlem Tamamlandı!</h2>
        {isOverallGain && (
          <p className="text-green-400 font-medium mt-1">
            Toplam {formatBytes(totalSavings)} kazanç sağlandı.
          </p>
        )}
      </div>

      {/* Sonuç Listesi */}
      <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3 mb-6">
        {results.map((result, idx) => (
          <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-slate-900/50 p-2 rounded-lg text-slate-400">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{result.fileName}</p>
                <div className="flex gap-2 text-xs">
                  <span className="text-slate-500 line-through">{result.originalSize}</span>
                  <ArrowRight size={12} className="text-slate-600 mt-0.5" />
                  <span className={`${result.isLarger ? 'text-orange-400' : 'text-green-400'} font-bold`}>
                    {result.newSize}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleDownload(result)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors ml-2 shadow-lg shadow-blue-900/20"
              title="İndir"
            >
              <Download size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 shrink-0">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-400 font-semibold hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> Yeni İşlem
        </button>
      </div>
    </div>
  );
};