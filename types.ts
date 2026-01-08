
export interface TranscriptionSegment {
  index: number;
  start: string; // Format: 00:00:00,000
  end: string;
  text: string;
}

export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  fullText: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type SegmentLength = 'short' | 'medium' | 'long';
