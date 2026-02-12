import React, { useState, useEffect } from 'react';
import { FileText, Loader2, AlertCircle, Images, ArrowRight, X, Download } from 'lucide-react';
import { loadLibraries, compressPdf, convertImagesToPdf, formatBytes } from './services/pdfService';
import { AppStatus, AppMode, CompressionResult, CompressionLevel } from './types';
import { UploadZone } from './components/UploadZone';
import { ConfigPanel } from './components/ConfigPanel';
import { ProcessingState } from './components/ProcessingState';
import { ResultView } from './components/ResultView';

export default function App() {
  const [mode, setMode] = useState<AppMode>('compress');
  
  // Sıkıştırma State'leri
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);

  // Dönüştürme State'leri
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [conversionResult, setConversionResult] = useState<Blob | null>(null);

  // Ortak State'ler
  const [status, setStatus] = useState<AppStatus>('loading_libs');
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState<string>("");

  useEffect(() => {
    loadLibraries()
      .then(() => setStatus('idle'))
      .catch((error) => {
        console.error("Kütüphane yükleme hatası:", error);
        alert("PDF kütüphaneleri yüklenemedi. Lütfen sayfayı yenileyin.");
        setStatus('error');
      });
  }, []);

  const resetApp = () => {
    setPdfFiles([]);
    setImageFiles([]);
    setStatus('idle');
    setCompressionLevel('medium');
    setProgress(0);
    setCompressionResults([]);
    setConversionResult(null);
    setProcessingMessage("");
  };

  // Sıkıştırma İşlemleri
  const handlePdfSelect = (files: File[]) => {
    const validFiles = files.filter(f => f.type === 'application/pdf');
    if (validFiles.length > 0) {
      setPdfFiles(prev => [...prev, ...validFiles]);
      setStatus('ready');
      setCompressionResults([]);
    } else {
      alert("Lütfen geçerli PDF dosyaları seçin.");
    }
  };

  const removePdf = (index: number) => {
    const newFiles = [...pdfFiles];
    newFiles.splice(index, 1);
    setPdfFiles(newFiles);
    if (newFiles.length === 0) setStatus('idle');
  };

  const startCompression = async () => {
    if (pdfFiles.length === 0) return;
    try {
      setStatus('processing');
      setProgress(0);
      setCompressionResults([]);

      const results: CompressionResult[] = [];
      
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        setProcessingMessage(`Dosya işleniyor: ${i + 1} / ${pdfFiles.length}`);
        
        // Bu dosyanın sıkıştırılması
        const result = await compressPdf(file, compressionLevel, (fileProgress) => {
          // Genel ilerlemeyi hesapla: (Tamamlananlar * 100 + Şuanki Dosya) / Toplam Dosya
          const totalProgress = ((i * 100) + fileProgress) / pdfFiles.length;
          setProgress(totalProgress);
        });
        
        results.push(result);
      }

      setCompressionResults(results);
      setStatus('done');
    } catch (error: any) {
      console.error("Sıkıştırma hatası:", error);
      alert("Hata: " + error.message);
      setStatus('ready');
    }
  };

  // Dönüştürme İşlemleri
  const handleImagesSelect = (files: File[]) => {
    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length > 0) {
      setImageFiles(prev => [...prev, ...validImages]);
      setStatus('ready');
    } else {
      alert("Lütfen geçerli resim dosyaları (JPG, PNG) seçin.");
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    if (newFiles.length === 0) setStatus('idle');
  };

  const startConversion = async () => {
    if (imageFiles.length === 0) return;
    try {
      setStatus('processing');
      setProcessingMessage("");
      setProgress(0);
      const pdfBlob = await convertImagesToPdf(imageFiles, setProgress);
      setConversionResult(pdfBlob);
      setStatus('done');
    } catch (error: any) {
      console.error("Dönüştürme hatası:", error);
      alert("Hata: " + error.message);
      setStatus('ready');
    }
  };

  const downloadConvertedPdf = () => {
    if (!conversionResult) return;
    const url = URL.createObjectURL(conversionResult);
    const a = document.createElement('a');
    a.href = url;
    a.download = "converted_images.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-4 relative">
      
      {/* Şirket Logosu - Sol Üst */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
         <img 
           src="https://desecuretechnology.com/wp-content/uploads/2024/05/400px.png" 
           alt="DeSecure" 
           className="h-10 md:h-14 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" 
         />
      </div>

      {/* Header */}
      <div className="text-center mb-8 max-w-2xl w-full pt-16 md:pt-0">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
          PDF Araçları
        </h1>
        <p className="text-slate-400 text-lg">
          PDF dosyalarınızı sıkıştırın veya resimlerinizi PDF'e dönüştürün.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-slate-800 transition-all duration-300">
        
        {/* Tab Switcher */}
        {status !== 'processing' && status !== 'done' && (
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => { setMode('compress'); resetApp(); }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold transition-colors ${mode === 'compress' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              <FileText size={18} /> PDF Sıkıştır
            </button>
            <button 
              onClick={() => { setMode('convert'); resetApp(); }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold transition-colors ${mode === 'convert' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              <Images size={18} /> Resimden PDF'e
            </button>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading_libs' && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-200">Sistem Başlatılıyor...</h3>
            <p className="text-slate-500 text-sm mt-2">Araçlar yükleniyor.</p>
          </div>
        )}

        {/* CONTENT FOR COMPRESSION MODE */}
        {mode === 'compress' && (
          <>
            {status === 'idle' && (
              <UploadZone 
                onFileSelect={handlePdfSelect} 
                multiple={true}
                title="PDF Dosyalarını Buraya Bırakın"
                subtitle="Birden fazla dosya seçebilirsiniz"
              />
            )}

            {status === 'ready' && pdfFiles.length > 0 && (
              <ConfigPanel 
                files={pdfFiles}
                level={compressionLevel}
                setLevel={setCompressionLevel}
                onRemove={removePdf}
                onStart={startCompression}
                onAdd={handlePdfSelect}
              />
            )}

            {status === 'done' && compressionResults.length > 0 && (
              <ResultView results={compressionResults} onReset={resetApp} />
            )}
          </>
        )}

        {/* CONTENT FOR CONVERSION MODE */}
        {mode === 'convert' && (
          <>
            {status === 'idle' && (
              <UploadZone 
                onFileSelect={handleImagesSelect} 
                accept="image/png, image/jpeg, image/jpg"
                multiple={true}
                title="Resimleri Buraya Bırakın"
                subtitle="JPG veya PNG dosyaları"
                icon={<Images size={32} />}
              />
            )}

            {status === 'ready' && imageFiles.length > 0 && (
              <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                    <Images size={20} className="text-blue-500" />
                    Seçilen Resimler ({imageFiles.length})
                  </h3>
                  <button onClick={() => document.getElementById('add-more-img')?.click()} className="text-xs text-blue-400 hover:text-blue-300">
                    + Ekle
                  </button>
                  <input 
                    id="add-more-img" 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files && handleImagesSelect(Array.from(e.target.files))} 
                  />
                </div>

                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 mb-6 custom-scrollbar">
                  {imageFiles.map((img, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center overflow-hidden border border-slate-700">
                          <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-300 truncate w-40">{img.name}</p>
                          <p className="text-xs text-slate-500">{formatBytes(img.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeImage(idx)} className="text-slate-500 hover:text-red-400 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startConversion}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
                >
                  PDF'e Dönüştür <ArrowRight size={20} />
                </button>
              </div>
            )}

            {status === 'done' && conversionResult && (
              <div className="p-8 flex flex-col items-center text-center animate-in slide-in-from-bottom-8 duration-500">
                <div className="w-16 h-16 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-900/50">
                  <FileText size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">PDF Hazır!</h2>
                <p className="text-slate-500 mb-8">Resimleriniz başarıyla birleştirildi.</p>
                
                <div className="flex gap-3 w-full">
                  <button
                    onClick={resetApp}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-400 font-semibold hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    Yeni İşlem
                  </button>
                  <button
                    onClick={downloadConvertedPdf}
                    className="flex-[2] py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download size={20} /> İndir
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Processing State (Shared) */}
        {status === 'processing' && (
          <ProcessingState progress={progress} mode={mode} message={processingMessage} />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-2 text-slate-500 text-sm text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <AlertCircle size={14} />
          <span>Tüm işlemler tarayıcınızda gerçekleşir. Hiçbir dosya sunucuya yüklenmez.</span>
        </div>
        <div className="flex flex-col md:flex-row gap-3 text-slate-400 font-medium">
             <a href="https://www.desecuretechnology.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">www.desecuretechnology.com</a>
             <span className="hidden md:inline text-slate-600">•</span>
             <a href="tel:4447633" className="hover:text-blue-400 transition-colors">444 76 33</a>
        </div>
      </div>
    </div>
  );
}