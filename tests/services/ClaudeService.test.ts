import { ClaudeService } from '../../src/services/ClaudeService';
import {
  claudeIntentionAnalysis,
  claudeModernArtAnalysis,
} from '../fixtures/claude-responses';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');

describe('ClaudeService', () => {
  let service: ClaudeService;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn();
    (Anthropic as unknown as jest.Mock).mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    }));

    service = new ClaudeService('test-api-key');
  });

  describe('analyzeIntention', () => {
    it('should analyze historical scientific query correctly', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify(claudeIntentionAnalysis),
          },
        ],
      });

      const result = await service.analyzeIntention(
        "Une gravure scientifique du 19e siècle sur l'électricité",
        '',
        ['met', 'unsplash']
      );

      expect(result.analysis.type).toBe('historique');
      expect(result.sources).toContain('met');
      expect(result.queries.met).toBeTruthy();
    });

    it('should analyze modern query correctly', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify(claudeModernArtAnalysis),
          },
        ],
      });

      const result = await service.analyzeIntention(
        "Photo moderne d'un bureau de travail",
        'Article sur le télétravail',
        ['met', 'unsplash']
      );

      expect(result.analysis.type).toBe('moderne');
      expect(result.sources).toContain('unsplash');
    });

    it('should handle JSON parsing errors with retry', async () => {
      mockCreate
        .mockResolvedValueOnce({
          content: [
            {
              type: 'text',
              text: 'Invalid JSON response',
            },
          ],
        })
        .mockResolvedValueOnce({
          content: [
            {
              type: 'text',
              text: JSON.stringify(claudeIntentionAnalysis),
            },
          ],
        });

      const result = await service.analyzeIntention('test', '', ['met']);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result.sources).toBeTruthy();
    });

    it('should use simple fallback after max retries', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Invalid JSON',
          },
        ],
      });

      const result = await service.analyzeIntention('electricity', '', [
        'met',
      ]);

      expect(result.queries.met).toBe('electricity');
      expect(result.reasoning).toContain('Fallback');
    });

    it('should handle markdown-wrapped JSON', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: '```json\n' + JSON.stringify(claudeIntentionAnalysis) + '\n```',
          },
        ],
      });

      const result = await service.analyzeIntention('test', '', ['met']);

      expect(result.analysis.type).toBe('historique');
    });

    it('should handle API authentication errors', async () => {
      const authError: any = new Error('Unauthorized');
      authError.status = 401;
      mockCreate.mockRejectedValue(authError);

      await expect(
        service.analyzeIntention('test', '', ['met'])
      ).rejects.toThrow('Invalid Anthropic API key');
    });
  });
});
