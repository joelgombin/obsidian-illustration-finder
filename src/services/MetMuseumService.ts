import { IllustrationResult } from '../types/types';

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';
const TIMEOUT = 10000;

export class MetMuseumService {
  async search(query: string, limit: number = 5): Promise<IllustrationResult[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&hasImages=true&isPublicDomain=true`;
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Met Museum search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const objectIDs: number[] | null = data.objectIDs;

      if (!objectIDs || objectIDs.length === 0) {
        return [];
      }

      const idsToFetch = objectIDs.slice(0, limit);
      const settled = await Promise.allSettled(
        idsToFetch.map((id) => this.getObjectDetails(id))
      );

      const results: IllustrationResult[] = [];
      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value.imageUrl) {
          results.push(result.value);
        }
      }

      return results;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getObjectDetails(objectId: number): Promise<IllustrationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const url = `${BASE_URL}/objects/${objectId}`;
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Met Museum object fetch failed: ${response.status}`);
      }

      const obj = await response.json();
      return this.parseObject(obj);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseObject(obj: any): IllustrationResult {
    const artist = obj.artistDisplayName || 'Unknown';
    return {
      id: String(obj.objectID),
      source: 'Metropolitan Museum',
      title: obj.title || 'Untitled',
      description: obj.medium || undefined,
      artist,
      date: obj.objectDate || undefined,
      imageUrl: obj.primaryImage || '',
      thumbnailUrl: obj.primaryImageSmall || obj.primaryImage || '',
      sourceUrl: obj.objectURL || '',
      license: 'CC0',
      attribution: `${artist}, Metropolitan Museum of Art (CC0)`,
      metadata: {
        department: obj.department,
        medium: obj.medium,
        dimensions: obj.dimensions,
      },
    };
  }
}
