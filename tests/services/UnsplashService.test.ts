import { UnsplashService } from '../../src/services/UnsplashService';
import { unsplashSearchResponse } from '../fixtures/unsplash-responses';

global.fetch = jest.fn();

describe('UnsplashService', () => {
  let service: UnsplashService;

  beforeEach(() => {
    service = new UnsplashService('test-api-key');
    jest.resetAllMocks();
  });

  it('should search and return results', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => unsplashSearchResponse,
    });

    const results = await service.search('office', 5);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      source: 'Unsplash',
      license: 'Unsplash License',
    });
  });

  it('should include API key in headers', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    await service.search('test', 5);

    const callArgs = (fetch as jest.Mock).mock.calls[0];
    expect(callArgs[1].headers['Authorization']).toBe(
      'Client-ID test-api-key'
    );
  });

  it('should generate correct attribution', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => unsplashSearchResponse,
    });

    const results = await service.search('test', 5);

    expect(results[0].attribution).toContain('John Photographer');
    expect(results[0].attribution).toContain('Unsplash');
  });

  it('should handle rate limiting errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    await expect(service.search('test', 5)).rejects.toThrow(/rate limit/i);
  });

  it('should name the API key as the cause of a 401', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(service.search('test', 5)).rejects.toThrow(/API key/i);
  });

  it('should handle empty results', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0, total_pages: 0, results: [] }),
    });

    const results = await service.search('nonexistent', 5);

    expect(results).toHaveLength(0);
  });
});
