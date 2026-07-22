import { requestUrl } from 'obsidian';
import { IllustrationResult, MetFilters } from '../types/types';

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

/**
 * Claude's suggested filters routinely narrow a search down to nothing: for
 * "electricity scientific engraving" the Met returns 20 objects unfiltered, 1
 * once a department is applied and 0 once a date range is added. Return
 * progressively looser filter sets so a search can fall back instead of
 * reporting no results.
 */
function relaxFilters(filters?: MetFilters): (MetFilters | undefined)[] {
  const hasDates = filters?.dateBegin != null || filters?.dateEnd != null;
  const hasDepartment = filters?.departmentId != null;

  if (!hasDates && !hasDepartment) return [undefined];

  const candidates: (MetFilters | undefined)[] = [filters];
  if (hasDates && hasDepartment) {
    candidates.push({ departmentId: filters?.departmentId });
  }
  candidates.push(undefined);
  return candidates;
}

export class MetMuseumService {
  async search(
    query: string,
    limit: number = 5,
    filters?: MetFilters
  ): Promise<IllustrationResult[]> {
    for (const candidate of relaxFilters(filters)) {
      const results = await this.searchWithFilters(query, limit, candidate);
      if (results.length > 0) return results;
    }

    return [];
  }

  private async searchWithFilters(
    query: string,
    limit: number,
    filters?: MetFilters
  ): Promise<IllustrationResult[]> {
    let url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&hasImages=true&isPublicDomain=true`;

    if (filters?.departmentId != null) {
      url += `&departmentId=${filters.departmentId}`;
    }
    if (filters?.dateBegin != null && filters?.dateEnd != null) {
      url += `&dateBegin=${filters.dateBegin}&dateEnd=${filters.dateEnd}`;
    }

    const response = await requestUrl({ url });
    const data = response.json;
    const objectIDs: number[] | null = data.objectIDs;

    if (!objectIDs || objectIDs.length === 0) {
      return [];
    }

    // Random sampling: pick `limit` random IDs from results
    const sampled = this.randomSample(objectIDs, limit);

    const settled = await Promise.allSettled(
      sampled.map((id) => this.getObjectDetails(id))
    );

    const results: IllustrationResult[] = [];
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value.imageUrl) {
        results.push(result.value);
      }
    }

    return results;
  }

  private randomSample(ids: number[], count: number): number[] {
    if (ids.length <= count) return ids;

    const sampled: number[] = [];
    const pool = [...ids];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      sampled.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return sampled;
  }

  async getObjectDetails(objectId: number): Promise<IllustrationResult> {
    const url = `${BASE_URL}/objects/${objectId}`;
    const response = await requestUrl({ url });
    return this.parseObject(response.json);
  }

  private parseObject(obj: Record<string, unknown>): IllustrationResult {
    const artist = (obj.artistDisplayName as string) || 'Unknown';
    return {
      id: String(obj.objectID),
      source: 'Metropolitan Museum',
      title: (obj.title as string) || 'Untitled',
      description: (obj.medium as string) || undefined,
      artist,
      date: (obj.objectDate as string) || undefined,
      imageUrl: (obj.primaryImage as string) || '',
      thumbnailUrl: (obj.primaryImageSmall as string) || (obj.primaryImage as string) || '',
      sourceUrl: (obj.objectURL as string) || '',
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
