import { ImageDownloader } from '../../src/services/ImageDownloader';
import { MockApp } from '../mocks/obsidian.mock';
import { IllustrationResult } from '../../src/types/types';

global.fetch = jest.fn();

describe('ImageDownloader', () => {
  let downloader: ImageDownloader;
  let mockApp: MockApp;

  const mockResult: IllustrationResult = {
    id: '1',
    source: 'Metropolitan Museum',
    title: 'Test Image',
    imageUrl: 'https://example.com/image.jpg',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    sourceUrl: 'https://example.com',
    license: 'CC0',
    attribution: 'Test Artist, Metropolitan Museum of Art (CC0)',
    metadata: {},
  };

  beforeEach(() => {
    mockApp = new MockApp();
    downloader = new ImageDownloader(mockApp as any);
    jest.clearAllMocks();
  });

  describe('downloadAndInsert', () => {
    it('should download image and save to vault', async () => {
      const mockImageData = new ArrayBuffer(1024);
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockImageData,
      });

      await downloader.downloadAndInsert({
        result: mockResult,
        targetFolder: 'Assets/Illustrations',
      });

      expect(fetch).toHaveBeenCalledWith(mockResult.imageUrl);
      expect(mockApp.vault.files.size).toBeGreaterThan(0);
    });

    it('should handle download errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        downloader.downloadAndInsert({
          result: mockResult,
          targetFolder: 'Assets',
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle HTTP error responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        downloader.downloadAndInsert({
          result: mockResult,
          targetFolder: 'Assets',
        })
      ).rejects.toThrow('Failed to download image');
    });
  });

  describe('generateFilename', () => {
    it('should generate unique filenames', async () => {
      const filename1 = downloader.generateFilename(mockResult);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const filename2 = downloader.generateFilename(mockResult);

      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('metropolitan-museum');
      expect(filename1).toContain('.jpg');
    });

    it('should sanitize special characters in title', () => {
      const result = { ...mockResult, title: 'Hello World! @#$% Test' };
      const filename = downloader.generateFilename(result);

      expect(filename).toContain('hello-world-test');
      expect(filename).not.toMatch(/[^a-z0-9_.-]/);
    });
  });

  describe('generateMarkdown', () => {
    it('should generate correct markdown with attribution', () => {
      const markdown = downloader.generateMarkdown(
        mockResult,
        'Assets/image.jpg'
      );

      expect(markdown).toContain('![Test Image]');
      expect(markdown).toContain('Assets/image.jpg');
      expect(markdown).toContain('Test Artist');
      expect(markdown).toContain('Metropolitan Museum');
    });
  });
});
