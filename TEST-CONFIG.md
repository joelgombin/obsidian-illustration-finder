---
type: test-configuration
project: obsidian-illustration-finder
created: '2026-02-16'
---
# Configuration et données de test

## Fichier .env pour développement

**`.env.example`** (à copier en `.env.local`) :

```env
# API Keys pour tests
ANTHROPIC_API_KEY=sk-ant-api03-xxxx
UNSPLASH_API_KEY=your_unsplash_access_key

# Configuration de test
TEST_VAULT_PATH=/path/to/test-vault
ILLUSTRATION_FOLDER=Assets/Test-Illustrations

# Debug
DEBUG=true
LOG_LEVEL=verbose
```

---

## Configuration de test Settings

**`tests/fixtures/test-settings.json`** :

```json
{
  "anthropicApiKey": "test-api-key-12345",
  "unsplashApiKey": "test-unsplash-key-67890",
  "illustrationFolder": "Assets/Test-Illustrations",
  "defaultSources": ["met", "unsplash"],
  "defaultResultCount": 5,
  "autoResize": true,
  "maxImageWidth": 1920,
  "includeAttribution": true,
  "attributionFormat": "*Source: {source} - {license}*",
  "cacheResults": false,
  "cacheDuration": 3600
}
```

---

## Exemples de requêtes de test

### Cas de test standards

**`tests/fixtures/test-queries.json`** :

```json
{
  "historique_scientifique": {
    "intention": "Une gravure scientifique du 19e siècle sur l'électricité",
    "context": "Article sur l'histoire des découvertes scientifiques",
    "expected_sources": ["gallica", "met"],
    "expected_type": "historique"
  },
  
  "art_classique": {
    "intention": "Peinture de paysage impressionniste",
    "context": "",
    "expected_sources": ["met"],
    "expected_type": "artistique"
  },
  
  "photo_moderne": {
    "intention": "Photo moderne d'un bureau avec ordinateur",
    "context": "Article sur le télétravail",
    "expected_sources": ["unsplash"],
    "expected_type": "moderne"
  },
  
  "abstrait": {
    "intention": "Illustration abstraite évoquant le temps",
    "context": "Présentation philosophique",
    "expected_sources": ["met", "gallica"],
    "expected_type": "abstraite"
  },
  
  "patrimoine_francais": {
    "intention": "Carte ancienne de Paris",
    "context": "",
    "expected_sources": ["gallica"],
    "expected_type": "historique"
  }
}
```

---

## Mock complet des APIs

**`tests/mocks/api-mocks.ts`** :

```typescript
import { metSearchResponse, metObjectDetails } from '../fixtures/met-museum-responses';
import { unsplashSearchResponse } from '../fixtures/unsplash-responses';
import { claudeIntentionAnalysis } from '../fixtures/claude-responses';

export class MockAPIs {
  private fetchMock: jest.Mock;
  
  constructor() {
    this.fetchMock = jest.fn();
    global.fetch = this.fetchMock;
  }
  
  setupSuccessfulMetSearch() {
    this.fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => metSearchResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => metObjectDetails
      });
  }
  
  setupSuccessfulUnsplashSearch() {
    this.fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => unsplashSearchResponse
    });
  }
  
  setupSuccessfulClaudeAnalysis() {
    this.fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{
          type: 'text',
          text: JSON.stringify(claudeIntentionAnalysis)
        }]
      })
    });
  }
  
  setupFullWorkflow() {
    // Claude analysis
    this.setupSuccessfulClaudeAnalysis();
    // Met search
    this.setupSuccessfulMetSearch();
    // Unsplash search
    this.setupSuccessfulUnsplashSearch();
  }
  
  setupNetworkError() {
    this.fetchMock.mockRejectedValue(new Error('Network error'));
  }
  
  setupRateLimitError() {
    this.fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });
  }
  
  reset() {
    this.fetchMock.mockReset();
  }
}
```

---

## Script de test manuel rapide

**`scripts/quick-test.ts`** :

```typescript
/**
 * Script de test manuel rapide
 * Usage: ts-node scripts/quick-test.ts
 */

import { MetMuseumService } from '../src/services/MetMuseumService';
import { UnsplashService } from '../src/services/UnsplashService';
import { ClaudeService } from '../src/services/ClaudeService';

async function testMetMuseum() {
  console.log('\n=== Test Met Museum ===');
  const service = new MetMuseumService();
  
  try {
    const results = await service.search('starry night', 3);
    console.log(`✓ Found ${results.length} results`);
    console.log('First result:', results[0].title);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

async function testUnsplash() {
  console.log('\n=== Test Unsplash ===');
  const apiKey = process.env.UNSPLASH_API_KEY;
  
  if (!apiKey) {
    console.log('⚠ Skipping (no API key)');
    return;
  }
  
  const service = new UnsplashService(apiKey);
  
  try {
    const results = await service.search('office', 3);
    console.log(`✓ Found ${results.length} results`);
    console.log('First result:', results[0].description);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

async function testClaude() {
  console.log('\n=== Test Claude Analysis ===');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('⚠ Skipping (no API key)');
    return;
  }
  
  const service = new ClaudeService(apiKey);
  
  try {
    const analysis = await service.analyzeIntention(
      'Une gravure scientifique du 19e siècle',
      '',
      ['met', 'gallica', 'unsplash']
    );
    console.log('✓ Analysis complete');
    console.log('Type:', analysis.analysis.type);
    console.log('Sources:', analysis.sources);
    console.log('Queries:', analysis.queries);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Quick Test Suite\n');
  
  await testMetMuseum();
  await testUnsplash();
  await testClaude();
  
  console.log('\n✅ Tests complete\n');
}

main().catch(console.error);
```

**Usage** :
```bash
# Installer ts-node si nécessaire
npm install -g ts-node

# Créer .env.local avec vos clés
cp .env.example .env.local

# Lancer le script
ts-node scripts/quick-test.ts
```

---

## Données de test pour cache

**`tests/fixtures/cache-test-data.ts`** :

```typescript
export const cachedSearchResults = {
  query: {
    intention: 'landscape painting',
    sources: ['met'],
    limit: 5
  },
  results: [
    {
      id: 'met-1',
      source: 'Metropolitan Museum' as const,
      title: 'View of the Domaine Saint-Joseph',
      artist: 'Paul Cézanne',
      date: 'ca. 1888',
      imageUrl: 'https://images.metmuseum.org/CRDImages/ep/original/DT1523.jpg',
      thumbnailUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1523.jpg',
      sourceUrl: 'https://www.metmuseum.org/art/collection/search/435868',
      license: 'CC0',
      attribution: 'Paul Cézanne, Metropolitan Museum (CC0)',
      metadata: {}
    }
  ],
  timestamp: Date.now(),
  errors: []
};
```

---

## Configuration Jest complète

**`jest.config.js`** :

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Paths
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',  // Main plugin file tested via integration
    '!src/types/**'  // Type definitions
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Coverage reporting
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Module mapping (if needed)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Globals
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true
      }
    }
  },
  
  // Timeout for async tests
  testTimeout: 10000
};
```

**`tests/setup.ts`** :

```typescript
// Setup global test environment

// Mock console methods to avoid noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock setTimeout/setInterval if needed
jest.useFakeTimers();

// Add custom matchers if needed
expect.extend({
  toBeValidIllustrationResult(received) {
    const pass = 
      received &&
      typeof received.id === 'string' &&
      typeof received.source === 'string' &&
      typeof received.title === 'string' &&
      typeof received.imageUrl === 'string' &&
      typeof received.license === 'string';
    
    if (pass) {
      return {
        message: () => 'Expected not to be a valid IllustrationResult',
        pass: true
      };
    } else {
      return {
        message: () => 'Expected to be a valid IllustrationResult',
        pass: false
      };
    }
  }
});
```

---

## Script de génération de fixtures

**`scripts/generate-fixtures.ts`** :

```typescript
/**
 * Script pour générer des fixtures depuis les vraies APIs
 * Utile pour créer des données de test réalistes
 * 
 * Usage: ts-node scripts/generate-fixtures.ts
 */

import fs from 'fs';
import path from 'path';

async function fetchMetSample() {
  const query = 'landscape';
  const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}&hasImages=true&isPublicDomain=true`;
  
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  
  const objectId = searchData.objectIDs[0];
  const objectUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
  
  const objectRes = await fetch(objectUrl);
  const objectData = await objectRes.json();
  
  return {
    searchResponse: {
      total: searchData.total,
      objectIDs: searchData.objectIDs.slice(0, 5)
    },
    objectDetails: objectData
  };
}

async function fetchUnsplashSample() {
  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) {
    console.log('⚠ Skipping Unsplash (no API key)');
    return null;
  }
  
  const url = `https://api.unsplash.com/search/photos?query=office&per_page=1`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Client-ID ${apiKey}`
    }
  });
  
  return await res.json();
}

async function main() {
  console.log('Generating fixtures...\n');
  
  // Met Museum
  console.log('Fetching Met Museum sample...');
  const metData = await fetchMetSample();
  fs.writeFileSync(
    path.join(__dirname, '../tests/fixtures/met-museum-responses.ts'),
    `export const metSearchResponse = ${JSON.stringify(metData.searchResponse, null, 2)};\n\n` +
    `export const metObjectDetails = ${JSON.stringify(metData.objectDetails, null, 2)};`
  );
  console.log('✓ Met Museum fixture saved\n');
  
  // Unsplash
  console.log('Fetching Unsplash sample...');
  const unsplashData = await fetchUnsplashSample();
  if (unsplashData) {
    fs.writeFileSync(
      path.join(__dirname, '../tests/fixtures/unsplash-responses.ts'),
      `export const unsplashSearchResponse = ${JSON.stringify(unsplashData, null, 2)};`
    );
    console.log('✓ Unsplash fixture saved\n');
  }
  
  console.log('✅ Fixtures generated successfully');
}

main().catch(console.error);
```

---

## Note de test Obsidian

**`test-vault/Test Note.md`** :

```markdown
# Test Note for Illustration Finder Plugin

Cette note est utilisée pour tester le plugin Illustration Finder.

## Section 1 : Art classique

[Placer le curseur ici et tester insertion d'une peinture]



## Section 2 : Science

[Tester illustration scientifique]



## Section 3 : Photo moderne

[Tester photo Unsplash]



## Résultats

- [ ] Insertion fonctionne
- [ ] Attribution correcte
- [ ] Images visibles
- [ ] Markdown valide
```

---

## Commandes NPM utiles

**`package.json`** (scripts à ajouter) :

```json
{
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:quick": "ts-node scripts/quick-test.ts",
    "fixtures:generate": "ts-node scripts/generate-fixtures.ts",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src/**/*.ts tests/**/*.ts"
  }
}
```

---

#configuration #test-data #fixtures #mocks
