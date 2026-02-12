export interface CompressionResult {
  originalSizeRaw: number;
  originalSize: string;
  newSizeRaw: number;
  newSize: string;
  ratio: number;
  isLarger: boolean;
  blob: Blob;
  fileName: string;
}

export type AppStatus = 'loading_libs' | 'idle' | 'ready' | 'processing' | 'done' | 'error';
export type AppMode = 'compress' | 'convert';
export type CompressionLevel = 'low' | 'medium' | 'high';

declare global {
  interface Window {
    jspdf: any;
    pdfjsLib: any;
    PDFLib: any;
  }
}