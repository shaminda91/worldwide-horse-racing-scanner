/**
 * Horse Racing & Scanner Data Models
 */

export type Language = 'si' | 'en';

export type RaceRegion = 
  | 'all' 
  | 'uk_ire' 
  | 'usa' 
  | 'aus_nz' 
  | 'dubai' 
  | 'hk_japan' 
  | 'south_asia';

export type RaceStatus = 'FINISHED' | 'LIVE' | 'UPCOMING';

export interface Runner {
  number: number;
  horseName: string;
  horseNameSi: string;
  jockey: string;
  trainer: string;
  barrier: number;
  weight: string;
  odds: string; // e.g. "3.50", "9/2"
  decimalOdds: number;
  finishPosition: number | null; // 1, 2, 3 or null if not finished
  margin?: string;
  silkColor: string; // CSS color or hex
  silkPattern?: 'stripes' | 'stars' | 'solid' | 'sash';
  payout?: string;
  form?: string; // e.g. "1-2-1"
}

export interface RaceFixture {
  id: string;
  name: string;
  nameSi: string;
  track: string;
  trackSi: string;
  city: string;
  country: string;
  flag: string;
  region: RaceRegion;
  date: string;
  time: string;
  distance: string;
  going: string; // track condition: Good, Firm, Soft, Muddy
  goingSi: string;
  surface: 'Turf' | 'Dirt' | 'All-Weather';
  prize: string;
  status: RaceStatus;
  raceNumber: number;
  runners: Runner[];
  summaryEn: string;
  summarySi: string;
}

export interface ScanDetectionResult {
  success: boolean;
  detectedHorseName: string;
  detectedHorseNameSi?: string;
  detectedTrack: string;
  detectedTrackSi?: string;
  raceDate: string;
  raceNumber: string | number;
  betType: string;
  stakeAmount?: string;
  finishPosition: number | null;
  finishStatus: 'WIN' | 'PLACE' | 'LOST' | 'UPCOMING' | 'UNKNOWN';
  margin?: string;
  odds?: string;
  payout?: string;
  jockey?: string;
  trainer?: string;
  confidenceScore: number;
  extractedRawText: string;
  sinhalaExplanation: string;
  englishExplanation: string;
  fullRunners?: Runner[];
  source: 'ai_vision' | 'catalog_match';
  scannedAt: string;
  matchedFixtureId?: string;
}

export interface PresetSampleSlip {
  id: string;
  title: string;
  titleSi: string;
  track: string;
  horseName: string;
  horseNameSi: string;
  badge: string;
  description: string;
  descriptionSi: string;
  mockImageSvg: string;
}
