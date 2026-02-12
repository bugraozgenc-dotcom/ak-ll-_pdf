import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFileSelect, 
  accept = ".pdf",
  multiple = false,
  title = "PDF Dosyanızı Buraya Bırakın",
  subtitle = "veya dosya seçmek için tıklayın",
  icon
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(Array.from(e.target.files));
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Eğer mouse child elementlere girdiyse state'i değiştirmemek için kontrol eklenebilir
    // Ancak pointer-events-none ile child element etkileşimini kapattığımız için
    // sadece ana container'dan çıkışta tetiklenir.
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  return (
    <div
      className={`
        relative p-10 flex flex-col items-center justify-center 
        border-dashed border-2 m-4 rounded-3xl 
        transition-all duration-300 ease-out cursor-pointer group 
        animate-in fade-in zoom-in
        ${isDragging 
          ? 'border-blue-400 bg-blue-500/10 scale-[1.02] shadow-xl shadow-blue-500/10' 
          : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 hover:scale-[1.01]'
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
      />
      
      {/* İçerik elemanlarına pointer-events-none ekleyerek sürükleme sırasında titremeyi önlüyoruz */}
      <div className="pointer-events-none flex flex-col items-center z-10">
        <div className={`
          bg-slate-800 p-5 rounded-2xl mb-4 
          text-blue-500 border border-slate-700
          transition-all duration-300 transform
          ${isDragging 
            ? 'scale-110 rotate-6 shadow-lg shadow-blue-500/20 bg-slate-700 border-blue-400/50 text-blue-400' 
            : 'group-hover:scale-110 group-hover:-rotate-3 group-hover:border-blue-500/30'
          }
        `}>
          {icon || <Upload size={36} strokeWidth={1.5} />}
        </div>
        
        <h3 className={`
          text-xl font-bold mb-2 transition-colors duration-300 
          ${isDragging ? 'text-blue-400' : 'text-slate-200 group-hover:text-blue-400'}
        `}>
          {title}
        </h3>
        
        <p className={`
          text-sm text-center transition-colors duration-300 
          ${isDragging ? 'text-blue-300/80' : 'text-slate-500 group-hover:text-slate-400'}
        `}>
          {subtitle}
        </p>
      </div>

      {/* Arka plan efekti (opsiyonel, hover/drag durumunda ekstra parıltı için) */}
      <div className={`
        absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none
        bg-gradient-to-tr from-blue-500/5 to-transparent
        ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
      `} />
    </div>
  );
};