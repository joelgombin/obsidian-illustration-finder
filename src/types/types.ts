export type IllustrationSource = 'Metropolitan Museum' | 'Unsplash';

export interface IllustrationResult {
  id: string;
  source: IllustrationSource;
  title: string;
  description?: string;
  artist?: string;
  date?: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourceUrl: string;
  license: string;
  attribution: string;
  metadata: Record<string, unknown>;
}

export interface MetFilters {
  departmentId?: number;
  dateBegin?: number;
  dateEnd?: number;
}

export interface IntentionAnalysis {
  analysis: {
    type: string;
    period: string | null;
    style: string | null;
    keywords: string[];
  };
  sources: string[];
  queries: Record<string, string>;
  reasoning: string;
  metFilters?: MetFilters;
}

export interface SearchParams {
  intention: string;
  context?: string;
  sources: string[];
  limit: number;
}

export interface SearchResults {
  query: SearchParams;
  analysis: IntentionAnalysis;
  results: IllustrationResult[];
  errors: SearchError[];
  timestamp: number;
}

export interface SearchError {
  source: string;
  error: string;
  query: string;
}

export interface DownloadOptions {
  result: IllustrationResult;
  targetFolder: string;
  maxWidth?: number;
}
