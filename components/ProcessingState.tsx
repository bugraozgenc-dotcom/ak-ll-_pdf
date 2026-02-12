import React from 'react';
import { AppMode } from '../types';

interface ProcessingStateProps {
  progress: number;
  mode?: AppMode;
  message?: string;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ progress, mode = 'compress', message }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Progress'i 0-100 aralığında ve sayısal olduğundan emin ol
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  const getStatusText = () => {
    if (message) return message;
    
    if (mode === 'convert') {
      if (safeProgress < 30) return 'Resimler Hazırlanıyor...';
      if (safeProgress < 80) return 'PDF Sayfaları Oluşturuluyor...';
      return 'Dosya Paketleniyor...';
    } else {
      if (safeProgress < 30) return 'Dosya Analiz Ediliyor...';
      if (safeProgress < 80) return 'Sıkıştırma Uygulanıyor...';
      return 'Son İşlemler...';
    }
  };

  return (
    <div className="py-16 px-8 flex flex-col items-center justify-center text-center w-full">
      
      {/* İlerleme Çemberi Container */}
      <div className="relative w-40 h-40 mb-8 group">
        
        {/* Arka Plan Efektleri */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping opacity-75 duration-1000"></div>
        <div className="absolute inset-4 bg-blue-500/5 rounded-full animate-pulse"></div>
        
        {/* Arka Plan Halkası */}
        <div className="absolute inset-0 rounded-full border-8 border-slate-800/50 backdrop-blur-sm shadow-inner shadow-black/50"></div>

        {/* SVG İlerleme */}
        <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] relative z-10">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Merkezdeki Yüzde */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-100 z-20">
          <div className="flex items-baseline">
            <span className="text-4xl font-black tabular-nums tracking-tighter drop-shadow-lg">
              {Math.round(safeProgress)}
            </span>
            <span className="text-lg font-bold text-blue-400 ml-0.5">%</span>
          </div>
        </div>
      </div>

      {/* Durum Metinleri */}
      <div className="space-y-3 z-10">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 animate-pulse">
          {getStatusText()}
        </h3>
        <p className="text-slate-500 text-sm font-medium max-w-[250px] mx-auto leading-relaxed">
          {mode === 'convert' 
            ? 'Yüksek kaliteli PDF oluşturulurken lütfen bekleyin.' 
            : 'Görüntü kalitesi optimize ediliyor.'}
        </p>
      </div>
      
      {/* Alt Bar */}
      <div className="w-64 h-1.5 bg-slate-800/50 rounded-full mt-8 overflow-hidden backdrop-blur-sm border border-slate-700/30">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300 relative shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${safeProgress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};