---
type: technical-specs
project: obsidian-illustration-finder
status: ready-for-development
target: claude-code
created: '2026-02-16'
version: '1.0'
---
# Spécifications : Plugin Obsidian - Illustration Finder

## Vue d'ensemble

### Objectif
Développer un plugin Obsidian qui permet aux utilisateurs de rechercher et insérer des illustrations libres de droit directement dans leurs notes, en utilisant un agent Claude intelligent qui analyse les intentions et interroge plusieurs sources (Metropolitan Museum API, Unsplash API, et suggestions via web search pour Gallica).

### Valeur ajoutée
- Gain de temps : recherche automatisée sur plusieurs sources
- Intelligence contextuelle : l'agent comprend l'intention et choisit les meilleures sources
- Workflow intégré : tout se passe dans Obsidian
- Qualité garantie : sources fiables et libres de droit

### Utilisateurs cibles
- Créateurs de contenu (blogs, présentations)
- Formateurs et enseignants
- Chercheurs académiques
- Rédacteurs techniques

---

## Architecture technique

### Stack technologique
- **Langage** : TypeScript
- **Framework** : Obsidian Plugin API
- **IA** : Anthropic Claude API (claude-sonnet-4-20250514)
- **APIs externes** :
  - Metropolitan Museum Collection API (gratuit, pas de clé nécessaire)
  - Unsplash API (nécessite clé gratuite)
  - Web search via MCP pour Gallica (parsing des résultats)

### Structure du projet

```
obsidian-illustration-finder/
├── src/
│   ├── main.ts                    # Point d'entrée du plugin
│   ├── settings.ts                # Gestion des paramètres
│   ├── modals/
│   │   ├── SearchModal.ts         # Modal de recherche
│   │   ├── ResultsModal.ts        # Modal d'affichage des résultats
│   │   └── SettingsModal.ts       # Modal des paramètres
│   ├── services/
│   │   ├── ClaudeService.ts       # Service d'interaction avec Claude
│   │   ├── MetMuseumService.ts    # Service Met Museum API
│   │   ├── UnsplashService.ts     # Service Unsplash API
│   │   ├── GallicaService.ts      # Service recherche Gallica (via web search)
│   │   └── ImageDownloader.ts     # Service de téléchargement d'images
│   ├── types/
│   │   └── types.ts               # Définitions TypeScript
│   └── utils/
│       ├── markdown.ts            # Utilitaires Markdown
│       └── image.ts               # Utilitaires image
├── styles.css                      # Styles du plugin
├── manifest.json                   # Manifeste Obsidian
├── package.json
├── tsconfig.json
└── README.md
```

---

## Spécifications fonctionnelles

### F1 : Commande de recherche d'illustration

**Déclenchement** : 
- Palette de commandes : "Illustration Finder: Rechercher une illustration"
- Raccourci clavier : `Ctrl+Shift+I` (configurable)
- Menu contextuel de l'éditeur

**Workflow** :
1. Utilisateur lance la commande
2. Modal de recherche s'ouvre
3. Utilisateur saisit son intention
4. Agent Claude analyse l'intention
5. Requêtes API lancées en parallèle
6. Résultats affichés dans modal
7. Utilisateur sélectionne une image
8. Image téléchargée et insérée dans la note

**Critères d'acceptation** :
- Modal s'ouvre en < 200ms
- Analyse de l'intention en < 3s
- Recherche complète en < 10s
- Image insérée au curseur actuel

---

### F2 : Modal de recherche

**Interface** :

```
┌──────────────────────────────────────────────────┐
│  Rechercher une illustration               [×]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  Décrivez votre intention :                     │
│  ┌────────────────────────────────────────────┐ │
│  │ Une gravure scientifique du 19e siècle    │ │
│  │ évoquant l'électricité ou les expériences │ │
│  │ de physique                                │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Contexte (optionnel) :                         │
│  ┌────────────────────────────────────────────┐ │
│  │ Article de blog sur l'histoire de l'IA    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Sources prioritaires :                         │
│  ☑ Metropolitan Museum                          │
│  ☑ Unsplash                                     │
│  ☑ Gallica (BnF)                                │
│                                                  │
│  Nombre de résultats : [5]                      │
│                                                  │
│              [Annuler]  [Rechercher]            │
└──────────────────────────────────────────────────┘
```

**Champs** :
- **Intention** (required, textarea, 500 chars max) : Description de l'illustration souhaitée
- **Contexte** (optional, textarea, 300 chars max) : Contexte de la note pour affiner la recherche
- **Sources** (checkboxes) : Sélection des sources à interroger
- **Nombre de résultats** (number input, 1-20, default 5)

**Validation** :
- Intention ne peut pas être vide
- Au moins une source doit être sélectionnée
- Nombre de résultats entre 1 et 20

**Comportement** :
- Focus automatique sur champ "Intention" à l'ouverture
- Enter dans champ "Intention" lance la recherche
- ESC ferme le modal
- Bouton "Rechercher" désactivé pendant recherche (spinner)

---

### F3 : Analyse de l'intention par Claude

**Service** : `ClaudeService.ts`

**Prompt système** :

```typescript
const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la recherche d'illustrations libres de droit.

Tu as accès à cette skill qui décrit les meilleures sources :
{SKILL_CONTENT}

Ton rôle :
1. Analyser l'intention de l'utilisateur
2. Déterminer le type d'illustration recherché (historique, moderne, abstraite, artistique, etc.)
3. Choisir les 2-3 meilleures sources selon la skill
4. Formuler des requêtes de recherche optimales pour chaque source sélectionnée
5. Retourner uniquement un JSON valide, sans texte avant ou après

Format de réponse JSON attendu :
{
  "analysis": {
    "type": "historique|moderne|artistique|scientifique|abstraite|conceptuelle",
    "period": "string ou null",
    "style": "string ou null",
    "keywords": ["mot1", "mot2", "mot3"]
  },
  "sources": ["met", "unsplash", "gallica"],
  "queries": {
    "met": "requête optimisée pour Met Museum en anglais",
    "unsplash": "requête optimisée pour Unsplash en anglais",
    "gallica": "requête optimisée pour Gallica en français"
  },
  "reasoning": "Explication concise du choix des sources et des requêtes"
}

Règles importantes :
- Pour des sujets historiques/patrimoine français → privilégier Gallica
- Pour de l'art classique → privilégier Met Museum
- Pour des photos modernes → privilégier Unsplash
- Les requêtes doivent être en anglais pour Met/Unsplash, en français pour Gallica
- Les requêtes doivent être courtes et précises (3-6 mots)
- Retourne UNIQUEMENT le JSON, sans markdown, sans texte explicatif`;
```

**Méthode** :

```typescript
interface IntentionAnalysis {
  analysis: {
    type: string;
    period: string | null;
    style: string | null;
    keywords: string[];
  };
  sources: string[];
  queries: {
    met?: string;
    unsplash?: string;
    gallica?: string;
  };
  reasoning: string;
}

async analyzeIntention(
  intention: string, 
  context: string, 
  selectedSources: string[]
): Promise<IntentionAnalysis>
```

**Gestion d'erreurs** :
- Si Claude retourne un format invalide → retry 1 fois
- Si échec après retry → fallback vers requêtes simples (utiliser directement l'intention comme query)
- Logger tous les échecs pour debugging

---

### F4 : Modal de résultats

**Interface** :

```
┌──────────────────────────────────────────────────────────┐
│  Résultats de recherche                           [×]    │
│  8 illustrations trouvées                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ┌─────────┐  Expériences d'électricité          │ │
│  │  │         │  Gravure, 1889                       │ │
│  │  │  [IMG]  │  Source : Gallica (BnF)              │ │
│  │  │         │  Licence : Domaine public            │ │
│  │  └─────────┘                                       │ │
│  │              [Prévisualiser]  [Insérer]           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ┌─────────┐  Tesla Laboratory Interior           │ │
│  │  │         │  Photograph, 1890s                    │ │
│  │  │  [IMG]  │  Source : Metropolitan Museum        │ │
│  │  │         │  Licence : CC0                        │ │
│  │  └─────────┘                                       │ │
│  │              [Prévisualiser]  [Insérer]           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [...]                                                   │
│                                                          │
│                         [Fermer]                         │
└──────────────────────────────────────────────────────────┘
```

**Éléments par résultat** :
- Thumbnail (150x150px, lazy loading)
- Titre de l'œuvre
- Métadonnées (artiste/date si disponible)
- Source
- Type de licence
- Bouton "Prévisualiser" (ouvre image en grand)
- Bouton "Insérer"

**Tri des résultats** :
1. Sources dans l'ordre de pertinence analysé par Claude
2. Au sein de chaque source, ordre retourné par l'API

**Comportement** :
- Scroll si > 6 résultats
- Click sur thumbnail → prévisualisation
- Click sur "Insérer" → téléchargement + insertion + fermeture du modal
- Message si aucun résultat trouvé

---

### F5 : Services API

#### MetMuseumService.ts

**API Endpoint** : `https://collectionapi.metmuseum.org/public/collection/v1/`

**Méthode principale** :

```typescript
interface MetMuseumResult {
  id: number;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
  objectUrl: string;
  department: string;
  medium: string;
}

async search(query: string, limit: number = 5): Promise<MetMuseumResult[]> {
  // 1. Search endpoint
  const searchResponse = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true&isPublicDomain=true`
  );
  
  // 2. Get object details for first N results
  const { objectIDs } = await searchResponse.json();
  
  // 3. Fetch details in parallel (max 5 concurrent)
  const results = await Promise.all(
    objectIDs.slice(0, limit).map(id => this.getObjectDetails(id))
  );
  
  // 4. Filter out results without images
  return results.filter(r => r.imageUrl);
}

async getObjectDetails(objectId: number): Promise<MetMuseumResult> {
  // Fetch and parse object details
}
```

**Rate limiting** :
- Max 5 requêtes concurrentes
- Pause de 200ms entre chaque batch
- Timeout de 10s par requête

**Cache** :
- Cache les résultats en mémoire pendant 1h
- Clé de cache : hash de la query

---

#### UnsplashService.ts

**API Endpoint** : `https://api.unsplash.com/`

**Configuration** :
- Nécessite API key (gratuite, 50 requêtes/heure)
- Stockée dans settings du plugin

**Méthode principale** :

```typescript
interface UnsplashResult {
  id: string;
  description: string;
  photographer: string;
  imageUrl: string;
  thumbnailUrl: string;
  downloadUrl: string;
  unsplashUrl: string;
  color: string;
}

async search(query: string, limit: number = 5): Promise<UnsplashResult[]> {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`,
    {
      headers: {
        'Authorization': `Client-ID ${this.apiKey}`
      }
    }
  );
  
  const data = await response.json();
  return data.results.map(photo => this.parsePhoto(photo));
}
```

**Attribution** :
- Format : `Photo by [Photographer] on Unsplash`
- Lien vers photo Unsplash dans attribution

---

#### GallicaService.ts

**Approche** : Web search + parsing (Gallica n'a pas d'API simple)

**Méthode** :

```typescript
interface GallicaResult {
  title: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
  gallicaUrl: string;
  type: string; // gravure, estampe, photographie, etc.
}

async search(query: string, limit: number = 5): Promise<GallicaResult[]> {
  // Option 1 : Utiliser l'API SRU de Gallica (XML, complexe)
  // Option 2 : Web search "site:gallica.bnf.fr [query]" puis parser
  
  // Pour MVP : Utiliser web search
  const searchQuery = `site:gallica.bnf.fr ${query} image`;
  
  // Utiliser MCP web_search ou faire requête Google Custom Search
  // Parser les résultats pour extraire les ARK
  // Construire les URLs IIIF
  
  return results;
}
```

**Note** : Pour MVP, on peut simplifier en suggérant une recherche Gallica manuelle, ou utiliser web_search pour avoir des suggestions de pages Gallica

---

### F6 : Téléchargement et insertion d'image

**Service** : `ImageDownloader.ts`

**Méthode** :

```typescript
interface DownloadOptions {
  result: IllustrationResult;
  targetFolder: string; // Configuré dans settings
  maxWidth?: number;    // Redimensionnement optionnel
}

async downloadAndInsert(options: DownloadOptions): Promise<void> {
  // 1. Télécharger l'image
  const response = await fetch(options.result.imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  
  // 2. Optionnel : redimensionner si > maxWidth
  let finalBuffer = arrayBuffer;
  if (options.maxWidth) {
    finalBuffer = await this.resizeImage(arrayBuffer, options.maxWidth);
  }
  
  // 3. Générer nom de fichier unique
  const filename = this.generateFilename(options.result);
  const filepath = `${options.targetFolder}/${filename}`;
  
  // 4. Sauvegarder dans vault
  await this.app.vault.createBinary(filepath, finalBuffer);
  
  // 5. Insérer dans note active
  const markdown = this.generateMarkdown(options.result, filepath);
  const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
  if (editor) {
    editor.replaceSelection(markdown);
  }
  
  // 6. Notification
  new Notice('✓ Image insérée avec succès');
}

generateMarkdown(result: IllustrationResult, filepath: string): string {
  // Format Markdown avec attribution
  return `![${result.title}](${filepath})
*${result.attribution}*`;
}

generateFilename(result: IllustrationResult): string {
  // Format : timestamp_source_title-sanitized.jpg
  const timestamp = Date.now();
  const source = result.source.toLowerCase().replace(/\s/g, '-');
  const title = result.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 50);
  
  return `${timestamp}_${source}_${title}.jpg`;
}
```

---

### F7 : Paramètres du plugin

**Interface settings** :

```typescript
interface IllustrationFinderSettings {
  // API Keys
  anthropicApiKey: string;
  unsplashApiKey: string;
  
  // Folders
  illustrationFolder: string; // Default: "Assets/Illustrations"
  
  // Behavior
  defaultSources: string[];   // Default: ["met", "unsplash", "gallica"]
  defaultResultCount: number; // Default: 5
  autoResize: boolean;        // Default: true
  maxImageWidth: number;      // Default: 1920
  
  // Attribution
  includeAttribution: boolean; // Default: true
  attributionFormat: string;   // Template string
  
  // Performance
  cacheResults: boolean;       // Default: true
  cacheDuration: number;       // Default: 3600 (1h in seconds)
}

const DEFAULT_SETTINGS: IllustrationFinderSettings = {
  anthropicApiKey: '',
  unsplashApiKey: '',
  illustrationFolder: 'Assets/Illustrations',
  defaultSources: ['met', 'unsplash', 'gallica'],
  defaultResultCount: 5,
  autoResize: true,
  maxImageWidth: 1920,
  includeAttribution: true,
  attributionFormat: '*Source: {source} - {license}*',
  cacheResults: true,
  cacheDuration: 3600
};
```

**Interface UI** :

```
┌──────────────────────────────────────────────┐
│  Illustration Finder - Paramètres           │
├──────────────────────────────────────────────┤
│                                              │
│  API Keys                                    │
│  ─────────                                   │
│  Anthropic API Key (requis) :               │
│  ┌────────────────────────────────────────┐ │
│  │ sk-ant-...                              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Unsplash API Key (optionnel) :             │
│  ┌────────────────────────────────────────┐ │
│  │                                         │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Dossiers                                    │
│  ────────                                    │
│  Dossier des illustrations :                │
│  ┌────────────────────────────────────────┐ │
│  │ Assets/Illustrations                    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Comportement                                │
│  ────────────                                │
│  ☑ Redimensionner automatiquement            │
│  Largeur max : [1920] px                     │
│                                              │
│  ☑ Inclure l'attribution                     │
│  ☑ Mettre en cache les résultats             │
│                                              │
│              [Enregistrer]                   │
└──────────────────────────────────────────────┘
```

---

## Spécifications techniques détaillées

### Types TypeScript

**types.ts** :

```typescript
// Résultat générique d'illustration
export interface IllustrationResult {
  id: string;
  source: 'Metropolitan Museum' | 'Unsplash' | 'Gallica';
  title: string;
  description?: string;
  artist?: string;
  date?: string;
  imageUrl: string;        // URL haute résolution
  thumbnailUrl: string;    // URL thumbnail
  sourceUrl: string;       // URL de la page source
  license: string;         // CC0, Domaine public, Unsplash License
  attribution: string;     // Texte d'attribution formaté
  metadata: Record<string, any>; // Métadonnées supplémentaires
}

// Analyse d'intention par Claude
export interface IntentionAnalysis {
  analysis: {
    type: string;
    period: string | null;
    style: string | null;
    keywords: string[];
  };
  sources: string[];
  queries: Record<string, string>;
  reasoning: string;
}

// Paramètres de recherche
export interface SearchParams {
  intention: string;
  context?: string;
  sources: string[];
  limit: number;
}

// Résultat de recherche globale
export interface SearchResults {
  query: SearchParams;
  analysis: IntentionAnalysis;
  results: IllustrationResult[];
  errors: SearchError[];
  timestamp: number;
}

// Erreur de recherche
export interface SearchError {
  source: string;
  error: string;
  query: string;
}
```

---

### Gestion des erreurs

**Stratégie** :

1. **Erreurs API** :
   - Retry automatique (max 2 fois) avec backoff exponentiel
   - Log dans console + affichage Notice utilisateur
   - Continuer avec les autres sources si une échoue

2. **Erreurs réseau** :
   - Timeout de 10s par requête
   - Message clair à l'utilisateur
   - Possibilité de réessayer

3. **Erreurs Claude** :
   - Si parsing JSON échoue → retry avec prompt plus strict
   - Si échec total → fallback vers recherche simple (utiliser intention directement)

4. **Erreurs de téléchargement** :
   - Vérifier l'espace disque
   - Vérifier les permissions du dossier
   - Message d'erreur explicite

**Exemple** :

```typescript
async searchAllSources(params: SearchParams): Promise<SearchResults> {
  const results: IllustrationResult[] = [];
  const errors: SearchError[] = [];
  
  // Paralléliser les recherches
  const promises = params.sources.map(async (source) => {
    try {
      const service = this.getService(source);
      const query = analysis.queries[source];
      const sourceResults = await service.search(query, params.limit);
      results.push(...sourceResults);
    } catch (error) {
      errors.push({
        source,
        error: error.message,
        query: analysis.queries[source]
      });
      console.error(`Error searching ${source}:`, error);
    }
  });
  
  await Promise.allSettled(promises);
  
  // Afficher erreurs si aucun résultat
  if (results.length === 0 && errors.length > 0) {
    new Notice('Aucun résultat trouvé. Voir la console pour détails.');
  }
  
  return {
    query: params,
    analysis,
    results,
    errors,
    timestamp: Date.now()
  };
}
```

---

### Performance et optimisation

**Cache** :

```typescript
class ResultCache {
  private cache = new Map<string, CacheEntry>();
  
  set(key: string, value: SearchResults, ttl: number) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
  }
  
  get(key: string): SearchResults | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  generateKey(params: SearchParams): string {
    return JSON.stringify({
      intention: params.intention,
      sources: params.sources.sort(),
      limit: params.limit
    });
  }
}
```

**Lazy loading des thumbnails** :

```typescript
// Dans ResultsModal
results.forEach((result, index) => {
  const img = itemEl.createEl('img', {
    attr: {
      'data-src': result.thumbnailUrl,
      'loading': 'lazy'
    }
  });
  
  // Observer pour lazy loading
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  
  observer.observe(img);
});
```

---

### Tests

**Tests unitaires** (avec Jest) :

```typescript
// tests/services/MetMuseumService.test.ts
describe('MetMuseumService', () => {
  it('should search and return results', async () => {
    const service = new MetMuseumService();
    const results = await service.search('landscape', 5);
    
    expect(results).toHaveLength(5);
    expect(results[0]).toHaveProperty('imageUrl');
    expect(results[0]).toHaveProperty('license', 'CC0');
  });
  
  it('should handle empty results', async () => {
    const service = new MetMuseumService();
    const results = await service.search('xyzabc123notfound', 5);
    
    expect(results).toHaveLength(0);
  });
});

// tests/services/ClaudeService.test.ts
describe('ClaudeService', () => {
  it('should analyze intention correctly', async () => {
    const service = new ClaudeService('test-key');
    const analysis = await service.analyzeIntention(
      'Une gravure scientifique du 19e siècle',
      '',
      ['met', 'gallica']
    );
    
    expect(analysis.sources).toContain('gallica');
    expect(analysis.analysis.type).toBe('historique');
  });
});
```

**Tests d'intégration** :

```typescript
describe('Integration: Full search workflow', () => {
  it('should complete full search from intention to results', async () => {
    const plugin = new IllustrationFinderPlugin();
    await plugin.loadSettings();
    
    const results = await plugin.executeSearch({
      intention: 'scientific illustration electricity',
      sources: ['met'],
      limit: 3
    });
    
    expect(results.results.length).toBeGreaterThan(0);
    expect(results.errors).toHaveLength(0);
  });
});
```

---

## Instructions de développement

### Prérequis

```bash
# Node.js 18+
node --version

# npm ou yarn
npm --version

# Obsidian installé pour tester le plugin
```

### Setup initial

```bash
# 1. Cloner le template de plugin Obsidian
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git obsidian-illustration-finder
cd obsidian-illustration-finder

# 2. Installer dépendances
npm install

# 3. Ajouter dépendances supplémentaires
npm install @anthropic-ai/sdk
npm install --save-dev @types/node

# 4. Configuration TypeScript
# Vérifier que tsconfig.json inclut :
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  }
}
```

### Structure à créer

1. **Créer les dossiers** :
```bash
mkdir -p src/modals
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils
mkdir -p tests
```

2. **Créer les fichiers de base** selon la structure décrite plus haut

3. **Modifier manifest.json** :
```json
{
  "id": "illustration-finder",
  "name": "Illustration Finder",
  "version": "1.0.0",
  "minAppVersion": "1.0.0",
  "description": "Recherchez et insérez des illustrations libres de droit avec l'aide de Claude AI",
  "author": "Votre nom",
  "authorUrl": "https://votre-site.com",
  "isDesktopOnly": false
}
```

### Développement

```bash
# Mode développement avec hot reload
npm run dev

# Le plugin se compile dans le dossier du vault Obsidian
# Créer un lien symbolique :
ln -s /path/to/obsidian-illustration-finder /path/to/vault/.obsidian/plugins/illustration-finder
```

### Tests

```bash
# Lancer les tests
npm test

# Coverage
npm run test:coverage
```

### Build production

```bash
# Build optimisé
npm run build

# Les fichiers sont dans le dossier dist/
# Copier main.js, manifest.json, styles.css dans le dossier du plugin
```

---

## Roadmap / Features futures (post-MVP)

### Phase 1 (MVP)
- [x] Recherche via Met Museum API
- [x] Recherche via Unsplash API
- [x] Analyse d'intention par Claude
- [x] Insertion d'image dans note
- [x] Settings de base

### Phase 2
- [ ] Recherche Gallica (via API SRU ou web scraping)
- [ ] Cache intelligent des résultats
- [ ] Redimensionnement automatique des images
- [ ] Prévisualisation plein écran
- [ ] Historique des recherches

### Phase 3
- [ ] Mode "Auto-illustrate" : analyse la note entière et suggère des endroits pour illustrations
- [ ] Collections : sauvegarder des favoris
- [ ] Export batch : télécharger plusieurs images d'un coup
- [ ] Intégration avec d'autres sources (Smithsonian, Rijksmuseum)
- [ ] Support des vidéos (Unsplash, Pexels)

### Phase 4
- [ ] Mode collaboratif : partager des collections d'illustrations
- [ ] API pour d'autres plugins
- [ ] Optimisation pour mobile (Obsidian Mobile)
- [ ] Support multilingue complet

---

## Checklist de livraison

### Code
- [ ] Tous les fichiers TypeScript compilent sans erreur
- [ ] Tests unitaires passent (> 80% coverage)
- [ ] Tests d'intégration passent
- [ ] Pas de console.log en production
- [ ] Code commenté et documenté

### Fonctionnel
- [ ] Recherche fonctionne sur les 3 sources
- [ ] Images s'insèrent correctement
- [ ] Attribution correcte selon la licence
- [ ] Settings persistent entre sessions
- [ ] Gestion d'erreurs robuste

### UX
- [ ] Modals responsives
- [ ] Loading states clairs
- [ ] Messages d'erreur explicites
- [ ] Raccourcis clavier fonctionnent
- [ ] Pas de freeze de l'UI

### Documentation
- [ ] README.md complet
- [ ] Instructions d'installation
- [ ] Guide d'utilisation
- [ ] FAQ
- [ ] Changelog

### Sécurité
- [ ] API keys stockées de manière sécurisée
- [ ] Pas de leak d'informations sensibles
- [ ] Validation des inputs utilisateur
- [ ] Sanitization des URLs

---

## Notes pour Claude Code

### Points d'attention particuliers

1. **Obsidian API** : 
   - Bien lire la doc officielle : https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
   - Utiliser `this.app` pour accéder au vault
   - Les modals héritent de `Modal` class

2. **Anthropic SDK** :
   - Utiliser `@anthropic-ai/sdk` version latest
   - Bien gérer les streaming responses si nécessaire
   - Rate limiting : 50 req/min sur tier 1

3. **Met Museum API** :
   - Pas de clé nécessaire
   - Pas de rate limiting strict mais être raisonnable
   - Certains objets n'ont pas d'images même avec `hasImages=true`

4. **Unsplash API** :
   - Nécessite inscription gratuite
   - 50 req/heure en gratuit
   - Obligation de tracker les downloads (endpoint séparé)

5. **Async/await** :
   - Bien gérer toutes les promises
   - Utiliser Promise.allSettled pour parallélisation
   - Timeout sur toutes les requêtes externes

6. **TypeScript** :
   - Mode strict activé
   - Typer toutes les interfaces
   - Éviter `any`

### Suggestions d'implémentation

**Ordre recommandé** :

1. Setup projet + structure
2. Settings et persistence
3. Service Met Museum (le plus simple)
4. ClaudeService pour analyse
5. Modal de recherche
6. Modal de résultats
7. ImageDownloader
8. Service Unsplash
9. Service Gallica (le plus complexe)
10. Tests
11. Polish UX

**Difficultés attendues** :

- **Gallica** : Pas d'API simple, nécessite du web scraping ou parsing SRU (XML)
  → Suggestion : Commencer par un placeholder qui suggère une recherche manuelle
  
- **Rate limiting** : Gérer les quotas API
  → Suggestion : Implémenter un simple queue system
  
- **Thumbnails** : Différentes résolutions selon les sources
  → Suggestion : Standardiser à 300x300px

---

## Ressources

### Documentation officielle
- Obsidian Plugin API : https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
- Anthropic SDK : https://github.com/anthropics/anthropic-sdk-typescript
- Met Museum API : https://metmuseum.github.io/
- Unsplash API : https://unsplash.com/documentation
- Gallica API SRU : https://api.bnf.fr/api-gallica-de-recherche

### Exemples de plugins Obsidian
- https://github.com/obsidianmd/obsidian-sample-plugin
- https://github.com/topics/obsidian-plugin

### Librairies utiles
- Image processing : `sharp` (si besoin de redimensionnement côté Node)
- HTTP client : `node-fetch` ou natif `fetch`
- Cache : Simple Map ou `node-cache`

---

## Contact et support

Pour toute question pendant le développement :
- Créer une issue sur le repo
- Consulter les specs dans `/docs/specs.md`
- Référencer la skill dans `Skills/Illustrations libres de droit.md`

---

*Specs version 1.0 - Créées le 16 février 2026*
*Pour développement par Claude Code*

#specs #plugin #obsidian #claude-code
