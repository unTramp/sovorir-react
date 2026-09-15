export type UUID = string;

export interface MediaAsset {
  id: UUID;
  url: string;
  mimeType: string;
  durationMs?: number;
  sizeBytes?: number;
  checksum?: string;
}

export type LearningLevel = 'A0' | 'A1' | 'A2' | 'B1';

