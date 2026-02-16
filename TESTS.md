---
type: test-guide
project: obsidian-illustration-finder
status: ready
created: '2026-02-16'
---
# Guide de tests - Illustration Finder Plugin

## Configuration des tests

### Installation des dépendances de test

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/jest-dom
```

### Configuration Jest

**jest.config.js** :

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## Mocks et fixtures

### Mock du vault Obsidian

**tests/mocks/obsidian.mock.ts** :

```typescript
export class MockApp {
  vault = new MockVault();
  workspace = new MockWorkspace();
}

export class MockVault {
  files: Map<string, any> = new Map();

  async read(path: string): Promise<string> {
    const file = this.files.get(path);
    if (!file) throw new Error(`File not found: ${path}`);
    return file.content;
  }

  async createBinary(path: string, data: ArrayBuffer): Promise<void> {
    this.files.set(path, { content: data, type: 'binary' });
  }

  getAbstractFileByPath(path: string) {
    return this.files.get(path);
  }
}

export class MockWorkspace {
  activeEditor: any = {
    editor: new MockEditor()
  };

  getActiveViewOfType(type: any) {
    return {
      editor: new MockEditor()
    };
  }
}

export class MockEditor {
  content: string = '';

  getValue(): string {
    return this.content;
  }

  replaceSelection(text: string) {
    this.content += text;
  }

  getCursor() {
    return { line: 0, ch: 0 };
  }
}

export class Notice {
  constructor(public message: string, public duration?: number) {}
  hide() {}
}

export class Modal {
  app: any;
  contentEl: HTMLElement;

  constructor(app: any) {
    this.app = app;
    this.contentEl = document.createElement('div');
  }

  open() {}
  close() {}
}
```

### Fixtures de données

**tests/fixtures/met-museum-responses.ts** :

```typescript
export const metSearchResponse = {
  total: 100,
  objectIDs: [1, 2, 3, 4, 5]
};

export const metObjectDetails = {
  objectID: 1,
  isPublicDomain: true,
  title: "The Starry Night",
  artistDisplayName: "Vincent van Gogh",
  objectDate: "1889",
  primaryImage: "https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg",
  primaryImageSmall: "https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg",
  objectURL: "https://www.metmuseum.org/art/collection/search/436532",
  department: "European Paintings",
  medium: "Oil on canvas",
  dimensions: "29 × 36 1/4 in. (73.7 × 92.1 cm)"
};

export const metObjectDetailsWithoutImage = {
  objectID: 2,
  isPublicDomain: true,
  title: "Ancient Coin",
  artistDisplayName: "Unknown",
  objectDate: "100 BC",
  primaryImage: "",
  primaryImageSmall: "",
  objectURL: "https://www.metmuseum.org/art/collection/search/123456",
  department: "Ancient Near Eastern Art"
};
```

**tests/fixtures/unsplash-responses.ts** :

```typescript
export const unsplashSearchResponse = {
  total: 500,
  total_pages: 50,
  results: [
    {
      id: "abc123",
      created_at: "2024-01-15T10:30:00Z",
      width: 4000,
      height: 3000,
      color: "#0C4A6E",
      description: "Modern office workspace with laptop",
      alt_description: "laptop on desk",
      urls: {
        raw: "https://images.unsplash.com/photo-123?ixid=xxx",
        full: "https://images.unsplash.com/photo-123?q=80&w=2000",
        regular: "https://images.unsplash.com/photo-123?q=80&w=1080",
        small: "https://images.unsplash.com/photo-123?q=80&w=400",
        thumb: "https://images.unsplash.com/photo-123?q=80&w=200"
      },
      links: {
        self: "https://api.unsplash.com/photos/abc123",
        html: "https://unsplash.com/photos/abc123",
        download: "https://unsplash.com/photos/abc123/download"
      },
      user: {
        id: "user123",
        username: "photographer",
        name: "John Photographer",
        portfolio_url: "https://unsplash.com/@photographer"
      }
    }
  ]
};
```

**tests/fixtures/claude-responses.ts** :

```typescript
export const claudeIntentionAnalysis = {
  analysis: {
    type: "historique",
    period: "19e siècle",
    style: "gravure scientifique",
    keywords: ["électricité", "expériences", "physique"]
  },
  sources: ["gallica", "met"],
  queries: {
    gallica: "gravure électricité 19e siècle expériences",
    met: "electricity scientific illustration 19th century"
  },
  reasoning: "Demande historique et scientifique → Gallica prioritaire pour patrimoine français, Met en complément pour illustrations scientifiques"
};

export const claudeModernArtAnalysis = {
  analysis: {
    type: "moderne",
    period: null,
    style: "photographie",
    keywords: ["bureau", "travail", "technologie"]
  },
  sources: ["unsplash", "met"],
  queries: {
    unsplash: "modern office workspace technology",
    met: "contemporary photography workplace"
  },
  reasoning: "Demande moderne et professionnelle → Unsplash prioritaire pour photos contemporaines"
};
```

---

## Tests unitaires

### MetMuseumService

**tests/services/MetMuseumService.test.ts** :

```typescript
import { MetMuseumService } from '../../src/services/MetMuseumService';
import { metSearchResponse, metObjectDetails, metObjectDetailsWithoutImage } from '../fixtures/met-museum-responses';

// Mock fetch
global.fetch = jest.fn();

describe('MetMuseumService', () => {
  let service: MetMuseumService;

  beforeEach(() => {
    service = new MetMuseumService();
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return results for valid query', async () => {
      // Mock search endpoint
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metSearchResponse
        })
        // Mock object details
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metObjectDetails
        });

      const results = await service.search('starry night', 1);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'The Starry Night',
        artist: 'Vincent van Gogh',
        license: 'CC0'
      });
      expect(results[0].imageUrl).toBeTruthy();
    });

    it('should filter out results without images', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ objectIDs: [1, 2] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metObjectDetails
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => metObjectDetailsWithoutImage
        });

      const results = await service.search('test', 2);

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('The Starry Night');
    });

    it('should handle empty search results', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ objectIDs: [] })
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
          json: async () => ({ objectIDs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
        });

      const limit = 3;
      await service.search('test', limit);

      // Should fetch exactly 'limit' object details (+ 1 for search)
      expect(fetch).toHaveBeenCalledTimes(limit + 1);
    });
  });

  describe('getObjectDetails', () => {
    it('should parse object details correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => metObjectDetails
      });

      const result = await service.getObjectDetails(1);

      expect(result).toMatchObject({
        id: '1',
        source: 'Metropolitan Museum',
        title: 'The Starry Night',
        artist: 'Vincent van Gogh',
        date: '1889',
        license: 'CC0'
      });
    });

    it('should generate correct attribution', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => metObjectDetails
      });

      const result = await service.getObjectDetails(1);

      expect(result.attribution).toContain('Vincent van Gogh');
      expect(result.attribution).toContain('Metropolitan Museum');
      expect(result.attribution).toContain('CC0');
    });
  });
});
```

### ClaudeService

**tests/services/ClaudeService.test.ts** :

```typescript
import { ClaudeService } from '../../src/services/ClaudeService';
import { claudeIntentionAnalysis, claudeModernArtAnalysis } from '../fixtures/claude-responses';
import Anthropic from '@anthropic-ai/sdk';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk');

describe('ClaudeService', () => {
  let service: ClaudeService;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn();
    (Anthropic as jest.Mock).mockImplementation(() => ({
      messages: {
        create: mockCreate
      }
    }));

    service = new ClaudeService('test-api-key');
  });

  describe('analyzeIntention', () => {
    it('should analyze historical scientific query correctly', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify(claudeIntentionAnalysis)
        }]
      });

      const result = await service.analyzeIntention(
        'Une gravure scientifique du 19e siècle sur l\'électricité',
        '',
        ['met', 'gallica', 'unsplash']
      );

      expect(result.analysis.type).toBe('historique');
      expect(result.sources).toContain('gallica');
      expect(result.queries.gallica).toBeTruthy();
    });

    it('should analyze modern query correctly', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify(claudeModernArtAnalysis)
        }]
      });

      const result = await service.analyzeIntention(
        'Photo moderne d\'un bureau de travail',
        'Article sur le télétravail',
        ['met', 'unsplash']
      );

      expect(result.analysis.type).toBe('moderne');
      expect(result.sources).toContain('unsplash');
    });

    it('should handle JSON parsing errors with fallback', async () => {
      // First attempt returns invalid JSON
      mockCreate
        .mockResolvedValueOnce({
          content: [{
            type: 'text',
            text: 'Invalid JSON response'
          }]
        })
        // Retry returns valid JSON
        .mockResolvedValueOnce({
          content: [{
            type: 'text',
            text: JSON.stringify(claudeIntentionAnalysis)
          }]
        });

      const result = await service.analyzeIntention('test', '', ['met']);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result.sources).toBeTruthy();
    });

    it('should use simple fallback after max retries', async () => {
      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: 'Invalid JSON'
        }]
      });

      const result = await service.analyzeIntention('electricity', '', ['met']);

      // Should return simple fallback
      expect(result.queries.met).toBe('electricity');
    });

    it('should include skill content in prompt', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify(claudeIntentionAnalysis)
        }]
      });

      await service.analyzeIntention('test', '', ['met']);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('skill');
    });
  });
});
```

### UnsplashService

**tests/services/UnsplashService.test.ts** :

```typescript
import { UnsplashService } from '../../src/services/UnsplashService';
import { unsplashSearchResponse } from '../fixtures/unsplash-responses';

global.fetch = jest.fn();

describe('UnsplashService', () => {
  let service: UnsplashService;

  beforeEach(() => {
    service = new UnsplashService('test-api-key');
    jest.clearAllMocks();
  });

  it('should search and return results', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => unsplashSearchResponse
    });

    const results = await service.search('office', 5);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      source: 'Unsplash',
      license: 'Unsplash License'
    });
  });

  it('should include API key in headers', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] })
    });

    await service.search('test', 5);

    const callArgs = (fetch as jest.Mock).mock.calls[0];
    expect(callArgs[1].headers['Authorization']).toBe('Client-ID test-api-key');
  });

  it('should generate correct attribution', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => unsplashSearchResponse
    });

    const results = await service.search('test', 5);

    expect(results[0].attribution).toContain('John Photographer');
    expect(results[0].attribution).toContain('Unsplash');
  });

  it('should handle rate limiting errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });

    await expect(service.search('test', 5)).rejects.toThrow();
  });
});
```

### ImageDownloader

**tests/services/ImageDownloader.test.ts** :

```typescript
import { ImageDownloader } from '../../src/services/ImageDownloader';
import { MockApp, MockVault } from '../mocks/obsidian.mock';

global.fetch = jest.fn();

describe('ImageDownloader', () => {
  let downloader: ImageDownloader;
  let mockApp: MockApp;

  beforeEach(() => {
    mockApp = new MockApp();
    downloader = new ImageDownloader(mockApp as any);
    jest.clearAllMocks();
  });

  describe('downloadAndInsert', () => {
    it('should download image and insert into note', async () => {
      const mockImageData = new ArrayBuffer(1024);
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockImageData
      });

      const result = {
        id: '1',
        source: 'Metropolitan Museum' as const,
        title: 'Test Image',
        imageUrl: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        sourceUrl: 'https://example.com',
        license: 'CC0',
        attribution: 'Test attribution',
        metadata: {}
      };

      await downloader.downloadAndInsert({
        result,
        targetFolder: 'Assets/Illustrations'
      });

      expect(fetch).toHaveBeenCalledWith(result.imageUrl);
      expect(mockApp.vault.files.size).toBe(1);
    });

    it('should generate unique filenames', async () => {
      const mockImageData = new ArrayBuffer(1024);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockImageData
      });

      const result = {
        id: '1',
        source: 'Metropolitan Museum' as const,
        title: 'Test Image',
        imageUrl: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        sourceUrl: 'https://example.com',
        license: 'CC0',
        attribution: 'Test',
        metadata: {}
      };

      const filename1 = downloader.generateFilename(result);
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const filename2 = downloader.generateFilename(result);

      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('metropolitan-museum');
      expect(filename1).toContain('.jpg');
    });

    it('should generate correct markdown', () => {
      const result = {
        id: '1',
        source: 'Metropolitan Museum' as const,
        title: 'Starry Night',
        imageUrl: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        sourceUrl: 'https://example.com',
        license: 'CC0',
        attribution: 'Vincent van Gogh, Met Museum (CC0)',
        metadata: {}
      };

      const markdown = downloader.generateMarkdown(
        result,
        'Assets/image.jpg'
      );

      expect(markdown).toContain('![Starry Night]');
      expect(markdown).toContain('Assets/image.jpg');
      expect(markdown).toContain('Vincent van Gogh');
      expect(markdown).toContain('Met Museum');
    });

    it('should handle download errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = {
        id: '1',
        source: 'Metropolitan Museum' as const,
        title: 'Test',
        imageUrl: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        sourceUrl: 'https://example.com',
        license: 'CC0',
        attribution: 'Test',
        metadata: {}
      };

      await expect(downloader.downloadAndInsert({
        result,
        targetFolder: 'Assets'
      })).rejects.toThrow('Network error');
    });
  });
});
```

---

## Tests d'intégration

**tests/integration/full-workflow.test.ts** :

```typescript
import { IllustrationFinderPlugin } from '../../src/main';
import { MockApp } from '../mocks/obsidian.mock';

describe('Integration: Full search workflow', () => {
  let plugin: IllustrationFinderPlugin;
  let mockApp: MockApp;

  beforeEach(async () => {
    mockApp = new MockApp();
    plugin = new IllustrationFinderPlugin(mockApp as any, {} as any);
    
    // Load with test settings
    await plugin.loadSettings();
    plugin.settings.anthropicApiKey = 'test-key';
  });

  it('should complete full search from intention to results', async () => {
    // Mock all external APIs
    global.fetch = jest.fn()
      // Claude API
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{
            type: 'text',
            text: JSON.stringify({
              sources: ['met'],
              queries: { met: 'landscape' },
              analysis: { type: 'artistique' }
            })
          }]
        })
      })
      // Met search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ objectIDs: [1] })
      })
      // Met object
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          objectID: 1,
          title: 'Landscape',
          primaryImage: 'https://example.com/img.jpg',
          primaryImageSmall: 'https://example.com/thumb.jpg',
          objectURL: 'https://example.com',
          isPublicDomain: true
        })
      });

    const results = await plugin.executeSearch({
      intention: 'landscape painting',
      sources: ['met'],
      limit: 1
    });

    expect(results.results.length).toBeGreaterThan(0);
    expect(results.errors).toHaveLength(0);
  });

  it('should handle partial failures gracefully', async () => {
    global.fetch = jest.fn()
      // Claude succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{
            type: 'text',
            text: JSON.stringify({
              sources: ['met', 'unsplash'],
              queries: { met: 'test', unsplash: 'test' }
            })
          }]
        })
      })
      // Met fails
      .mockRejectedValueOnce(new Error('Met API error'))
      // Unsplash succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

    const results = await plugin.executeSearch({
      intention: 'test',
      sources: ['met', 'unsplash'],
      limit: 5
    });

    expect(results.errors.length).toBe(1);
    expect(results.errors[0].source).toBe('met');
  });
});
```

---

## Tests manuels

### Checklist de tests manuels

```markdown
## Tests fonctionnels

### Recherche basique
- [ ] Ouvrir modal de recherche (Ctrl+Shift+I)
- [ ] Entrer intention simple ("landscape painting")
- [ ] Vérifier que résultats s'affichent
- [ ] Cliquer sur "Insérer"
- [ ] Vérifier image insérée dans note

### Sources multiples
- [ ] Rechercher avec Met + Unsplash activés
- [ ] Vérifier que résultats viennent des deux sources
- [ ] Vérifier tri par pertinence

### Gestion erreurs
- [ ] Rechercher sans API key configurée
- [ ] Vérifier message d'erreur clair
- [ ] Entrer API key invalide
- [ ] Vérifier gestion erreur API

### Attribution
- [ ] Insérer image Met Museum
- [ ] Vérifier attribution contient "CC0"
- [ ] Insérer image Unsplash
- [ ] Vérifier attribution contient photographe + "Unsplash"

### Performance
- [ ] Rechercher avec limite 20
- [ ] Vérifier que résultats s'affichent en < 10s
- [ ] Vérifier pas de freeze de l'UI

### Edge cases
- [ ] Recherche sans résultats
- [ ] Recherche avec caractères spéciaux
- [ ] Recherche très longue (500 caractères)
- [ ] Multiples insertions rapides
```

---

## Exécution des tests

### Commandes npm

```bash
# Tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch (développement)
npm run test:watch

# Tests d'un fichier spécifique
npm test -- MetMuseumService.test.ts

# Tests verbose
npm test -- --verbose
```

### CI/CD

**.github/workflows/test.yml** :

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Coverage
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Debugging

### Configuration VS Code

**.vscode/launch.json** :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasenameNoExtension}",
        "--config",
        "jest.config.js"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest All",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--config",
        "jest.config.js"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

#tests #plugin #obsidian #jest #tdd
