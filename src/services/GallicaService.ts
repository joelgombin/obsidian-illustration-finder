import { IllustrationResult } from '../types/types';

export class GallicaService {
  async search(query: string, limit: number = 5): Promise<IllustrationResult[]> {
    console.log(
      `[GallicaService] Placeholder - query: "${query}", limit: ${limit}`
    );
    // MVP: Return empty array. Full Gallica SRU/IIIF implementation in Phase 2.
    return [];
  }
}
