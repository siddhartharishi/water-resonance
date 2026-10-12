export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface AudioPayload {
  text?: string;
  audio?: string;
  mimeType?: string;
}

export interface SentimentAnalysisResult {
  sentiment: SentimentType;
  sentimentScore: number;
  coherence: number; // 0 - 100
  header: string;
  badgeLabel: string;
  badgeIcon: string;
  frequency: string;
  hzValue: number;
  field: string;
  primaryEmotion: string;
  molecularInsight: string;
  crystallineDescription: string;
  positiveAffirmationTransmutation?: string;
  quote?: string;
}

export interface AffirmationEntry {
  id: string;
  date: string;
  timestamp: number;
  quote: string;
  sentiment: SentimentType;
  coherence: number;
  frequency: string;
  primaryEmotion: string;
  insight: string;
}
