import IllustrationFinderPlugin from '../../src/main';
import { MockApp } from '../mocks/obsidian.mock';
import { metObjectDetails } from '../fixtures/met-museum-responses';
import { claudeIntentionAnalysis } from '../fixtures/claude-responses';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');

describe('Integration: Full search workflow', () => {
  let plugin: IllustrationFinderPlugin;
  let mockApp: MockApp;
  let mockCreate: jest.Mock;

  beforeEach(async () => {
    mockCreate = jest.fn();
    (Anthropic as unknown as jest.Mock).mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    }));

    mockApp = new MockApp();
    plugin = new IllustrationFinderPlugin(mockApp as any, {} as any);
    await plugin.loadSettings();
    plugin.settings.anthropicApiKey = 'test-key';

    // Re-init services with the test key
    (plugin as any).initServices();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should complete full search from intention to results', async () => {
    // Mock Claude analysis
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            analysis: { type: 'artistique', period: null, style: null, keywords: ['landscape'] },
            sources: ['met'],
            queries: { met: 'landscape painting' },
            reasoning: 'Art query',
          }),
        },
      ],
    });

    // Mock Met Museum search
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 1, objectIDs: [1] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => metObjectDetails,
      });

    const results = await plugin.executeSearch({
      intention: 'landscape painting',
      sources: ['met'],
      limit: 1,
    });

    expect(results.results.length).toBeGreaterThan(0);
    expect(results.errors).toHaveLength(0);
    expect(results.results[0].source).toBe('Metropolitan Museum');
  });

  it('should handle partial failures gracefully', async () => {
    // Mock Claude analysis
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            analysis: { type: 'mixed', period: null, style: null, keywords: ['test'] },
            sources: ['met', 'unsplash'],
            queries: { met: 'test', unsplash: 'test' },
            reasoning: 'Multi-source query',
          }),
        },
      ],
    });

    // Met fails, Unsplash not configured (no API key in this test path)
    global.fetch = jest.fn().mockRejectedValue(new Error('Met API error'));

    // Setup Unsplash service
    plugin.settings.unsplashApiKey = 'test-unsplash-key';
    (plugin as any).initServices();

    // Reset mockCreate for the new ClaudeService instance
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            analysis: { type: 'mixed', period: null, style: null, keywords: ['test'] },
            sources: ['met', 'unsplash'],
            queries: { met: 'test', unsplash: 'test' },
            reasoning: 'Multi-source query',
          }),
        },
      ],
    });

    const results = await plugin.executeSearch({
      intention: 'test',
      sources: ['met', 'unsplash'],
      limit: 5,
    });

    // Both should fail since fetch is mocked to reject
    expect(results.errors.length).toBeGreaterThan(0);
  });

  it('should work without Claude API key (fallback mode)', async () => {
    plugin.settings.anthropicApiKey = '';
    (plugin as any).initServices();

    // Mock Met Museum search
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 1, objectIDs: [1] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => metObjectDetails,
      });

    const results = await plugin.executeSearch({
      intention: 'landscape',
      sources: ['met'],
      limit: 1,
    });

    expect(results.results.length).toBeGreaterThan(0);
    expect(results.analysis.reasoning).toContain('No Anthropic API key');
  });

  it('should handle no results from any source', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            analysis: { type: 'unknown', period: null, style: null, keywords: ['nothing'] },
            sources: ['met'],
            queries: { met: 'xyznonexistent' },
            reasoning: 'Test',
          }),
        },
      ],
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0, objectIDs: null }),
    });

    const results = await plugin.executeSearch({
      intention: 'xyznonexistent',
      sources: ['met'],
      limit: 5,
    });

    expect(results.results).toHaveLength(0);
    expect(results.errors).toHaveLength(0);
  });
});
