import { CompressionResult, CompressionLevel } from '../types';

export const loadLibraries = async (): Promise<void> => {
  const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Sadece jsPDF ve PDF.js yükleniyor (Rasterization için)
  await Promise.all([
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js")
  ]);

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bayt';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bayt', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * PDF sayfalarını resme dönüştürüp yeniden PDF oluşturarak sıkıştırır.
 * Seviye bazlı sıkıştırma:
 * - low: Düşük sıkıştırma (Yüksek Kalite)
 * - medium: Orta sıkıştırma (Dengeli)
 * - high: Yüksek sıkıştırma (Düşük Kalite, Küçük Boyut)
 */
export const compressPdf = async (
  file: File,
  level: CompressionLevel,
  onProgress: (progress: number) => void
): Promise<CompressionResult> => {
  const { jsPDF } = window.jspdf;
  const pdfjsLib = window.pdfjsLib;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const totalPages = pdf.numPages;
  
  // Sıkıştırma seviyesine göre parametreleri belirle
  let scale = 1.0;
  let imageQuality = 0.5;

  switch (level) {
    case 'low': // Düşük Sıkıştırma = Yüksek Kalite
        scale = 1.5; // Daha yüksek çözünürlük
        imageQuality = 0.8; // Daha az JPEG sıkıştırması
        break;
    case 'medium': // Orta (Dengeli)
        scale = 1.0; // Standart çözünürlük
        imageQuality = 0.6;
        break;
    case 'high': // Yüksek Sıkıştırma = Düşük Kalite
        scale = 0.7; // Düşük çözünürlük
        imageQuality = 0.4; // Yüksek JPEG sıkıştırması
        break;
  }

  let doc: any = null;

  for (let i = 1; i <= totalPages; i++) {
    // İlerleme yüzdesini güncelle
    onProgress(Math.round(((i - 1) / totalPages) * 100));

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: scale });
    
    // Canvas oluştur
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Sayfayı canvas'a çiz
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Canvas'ı sıkıştırılmış JPEG verisine çevir
    const imgData = canvas.toDataURL('image/jpeg', imageQuality);

    // Yeni PDF dosyasına ekle
    if (i === 1) {
      doc = new jsPDF({
        orientation: viewport.width > viewport.height ? 'l' : 'p',
        unit: 'px',
        format: [viewport.width, viewport.height],
        compress: true
      });
    } else {
      doc.addPage(
        [viewport.width, viewport.height],
        viewport.width > viewport.height ? 'l' : 'p'
      );
    }

    doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
  }

  onProgress(100);
  
  // Blob oluştur
  const blob = doc.output('blob');
  
  const originalSize = file.size;
  const newSize = blob.size;
  const savingsRatio = ((originalSize - newSize) / originalSize);

  return {
    originalSizeRaw: originalSize,
    originalSize: formatBytes(originalSize),
    newSizeRaw: newSize,
    newSize: formatBytes(newSize),
    ratio: Math.round(savingsRatio * 100),
    isLarger: newSize > originalSize,
    blob: blob,
    fileName: file.name
  };
};

export const convertImagesToPdf = async (
  files: File[],
  onProgress: (progress: number) => void
): Promise<Blob> => {
  const { jsPDF } = window.jspdf;
  let doc: any = null;

  const loadImage = (file: File): Promise<{ width: number; height: number; data: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            data: reader.result as string
          });
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  for (let i = 0; i < files.length; i++) {
    onProgress(Math.round((i / files.length) * 100));
    const imageInfo = await loadImage(files[i]);

    if (i === 0) {
      doc = new jsPDF({
        orientation: imageInfo.width > imageInfo.height ? 'l' : 'p',
        unit: 'px',
        format: [imageInfo.width, imageInfo.height],
        compress: true
      });
    } else {
      doc.addPage(
        [imageInfo.width, imageInfo.height],
        imageInfo.width > imageInfo.height ? 'l' : 'p'
      );
    }

    doc.addImage(imageInfo.data, 'JPEG', 0, 0, imageInfo.width, imageInfo.height);
  }

  onProgress(100);
  return doc.output('blob');
};