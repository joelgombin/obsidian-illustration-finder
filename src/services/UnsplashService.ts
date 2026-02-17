import { IllustrationResult } from '../types/types';

const BASE_URL = 'https://api.unsplash.com';
const TIMEOUT = 10000;

export class UnsplashService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, limit: number = 5): Promise<IllustrationResult[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const url = `${BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.apiKey}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Unsplash rate limit exceeded (50 requests/hour)');
        }
        throw new Error(
          `Unsplash search failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return (data.results || []).map((photo: any) => this.parsePhoto(photo));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parsePhoto(photo: any): IllustrationResult {
    const photographerName = photo.user?.name || 'Unknown';
    return {
      id: photo.id,
      source: 'Unsplash',
      title: photo.description || photo.alt_description || 'Untitled',
      description: photo.alt_description || undefined,
      artist: photographerName,
      imageUrl: photo.urls?.regular || '',
      thumbnailUrl: photo.urls?.thumb || '',
      sourceUrl: photo.links?.html || '',
      license: 'Unsplash License',
      attribution: `Photo by ${photographerName} on Unsplash`,
      metadata: {
        color: photo.color,
        width: photo.width,
        height: photo.height,
        downloadUrl: photo.links?.download,
      },
    };
  }
}
