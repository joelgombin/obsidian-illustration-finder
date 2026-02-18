import { requestUrl } from 'obsidian';
import { IllustrationResult } from '../types/types';

interface UnsplashPhoto {
  id: string;
  description?: string;
  alt_description?: string;
  user?: { name?: string };
  urls?: { regular?: string; thumb?: string };
  links?: { html?: string; download?: string };
  color?: string;
  width?: number;
  height?: number;
}

const BASE_URL = 'https://api.unsplash.com';

export class UnsplashService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, limit: number = 5): Promise<IllustrationResult[]> {
    const url = `${BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;
    const response = await requestUrl({
      url,
      headers: {
        Authorization: `Client-ID ${this.apiKey}`,
      },
    });

      const data = await response.json();
      return (data.results || []).map((photo: UnsplashPhoto) => this.parsePhoto(photo));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parsePhoto(photo: UnsplashPhoto): IllustrationResult {
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
