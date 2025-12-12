export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  READY_TO_EDIT = 'READY_TO_EDIT',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type StockStyle = 'standard' | 'vibrant_product' | 'soft_portrait' | 'architectural' | 'cinematic';

export interface GenerationConfig {
  prompt: string;
  style: StockStyle;
  enhanceQuality: boolean;
}

export interface ImageAsset {
  data: string; // Base64
  mimeType: string;
}
