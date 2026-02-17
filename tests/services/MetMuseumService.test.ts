import { MetMuseumService } from '../../src/services/MetMuseumService';
import {
  metSearchResponse,
  metObjectDetails,
  metObjectDetailsWithoutImage,
} from '../fixtures/met-museum-responses';

global.fetch = jest.fn();

describe('MetMuseumService', () => {
  let service: MetMuseumService;

  beforeEach(() => {
    service = new MetMuseumService();
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return results for valid query', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metSearchResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metObjectDetails,
        });

      const results = await service.search('starry night', 1);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'The Starry Night',
        artist: 'Vincent van Gogh',
        license: 'CC0',
      });
      expect(results[0].imageUrl).toBeTruthy();
    });

    it('should filter out results without images', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ total: 2, objectIDs: [1, 2] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metObjectDetails,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metObjectDetailsWithoutImage,
        });

      const results = await service.search('test', 2);

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('The Starry Night');
    });

    it('should handle empty search results', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0, objectIDs: [] }),
      });

      const results = await service.search('nonexistent', 5);

      expect(results).toHaveLength(0);
    });

    it('should handle null objectIDs', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0, objectIDs: null }),
      });

      const results = await service.search('nonexistent', 5);

      expect(results).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.search('test', 5)).rejects.toThrow('Network error');
    });

    it('should respect limit parameter', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            total: 10,
            objectIDs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          }),
        })
        .mockResolvedValue({
          ok: true,
          json: async () => metObjectDetails,
        });

      const limit = 3;
      await service.search('test', limit);

      // 1 search call + limit detail calls
      expect(fetch).toHaveBeenCalledTimes(limit + 1);
    });
  });

  describe('getObjectDetails', () => {
    it('should parse object details correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => metObjectDetails,
      });

      const result = await service.getObjectDetails(1);

      expect(result).toMatchObject({
        id: '1',
        source: 'Metropolitan Museum',
        title: 'The Starry Night',
        artist: 'Vincent van Gogh',
        date: '1889',
        license: 'CC0',
      });
    });

    it('should generate correct attribution', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => metObjectDetails,
      });

      const result = await service.getObjectDetails(1);

      expect(result.attribution).toContain('Vincent van Gogh');
      expect(result.attribution).toContain('Metropolitan Museum');
      expect(result.attribution).toContain('CC0');
    });
  });
});
