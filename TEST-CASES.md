---
type: test-cases
project: obsidian-illustration-finder
created: '2026-02-16'
---
# Exemples de requêtes et résultats attendus

## Cas d'usage réels avec résultats attendus

### 1. Présentation sur l'histoire de l'IA

**Contexte** : Création de slides pour formation Lab IA

#### Requête 1.1 : Introduction historique
```
Intention: "Gravure ou dessin ancien représentant un automate ou une machine pensante du 18e ou 19e siècle"
Context: "Slide d'introduction sur les origines de l'IA"
Sources: Gallica, Met Museum
```

**Analyse Claude attendue** :
```json
{
  "analysis": {
    "type": "historique",
    "period": "18e-19e siècle",
    "style": "gravure",
    "keywords": ["automate", "machine", "pensante", "mécanique"]
  },
  "sources": ["gallica", "met"],
  "queries": {
    "gallica": "automate mécanique 18e 19e siècle gravure",
    "met": "automaton mechanical 18th 19th century"
  },
  "reasoning": "Sujet historique avec focus sur patrimoine français et européen → Gallica prioritaire pour gravures d'époque, Met en complément"
}
```

**Résultats espérés de Gallica** :
- "Le Turc mécanique" (automate joueur d'échecs)
- Illustrations de "L'Homme-machine" de La Mettrie
- Gravures d'horlogerie et d'automates du 18e

**Résultats espérés du Met** :
- Dessins techniques d'automates
- Illustrations scientifiques anciennes

---

#### Requête 1.2 : Ère moderne
```
Intention: "Photo moderne et élégante d'un centre de données ou de serveurs informatiques"
Context: "Slide sur l'infrastructure actuelle de l'IA"
Sources: Unsplash
```

**Analyse attendue** :
```json
{
  "analysis": {
    "type": "moderne",
    "keywords": ["data center", "servers", "technology"]
  },
  "sources": ["unsplash"],
  "queries": {
    "unsplash": "data center servers modern"
  },
  "reasoning": "Photo moderne de technologie → Unsplash optimal pour ce type de contenu"
}
```

---

### 2. Article de blog littéraire sur Borges

**Contexte** : Billet sur "La Bibliothèque de Babel"

#### Requête 2.1 : Portrait de l'auteur
```
Intention: "Portrait de Jorge Luis Borges"
Context: "Article de blog sur La Bibliothèque de Babel"
Sources: Wikimedia Commons, Gallica
```

**Résultats espérés** :
- Photos de Borges (domaine public si > 70 ans après décès)
- Attention : Borges décédé en 1986 → vérifier droits

---

#### Requête 2.2 : Illustration conceptuelle
```
Intention: "Gravure ancienne d'une bibliothèque labyrinthique ou d'étagères infinies de livres"
Context: "Illustrer le concept de bibliothèque infinie"
Sources: Gallica, Met
```

**Analyse attendue** :
```json
{
  "sources": ["gallica", "met"],
  "queries": {
    "gallica": "bibliothèque gravure rayonnages livres",
    "met": "library books shelves engraving"
  }
}
```

---

### 3. Document académique sur l'électricité

**Contexte** : Mémoire d'histoire des sciences

#### Requête 3.1 : Expériences historiques
```
Intention: "Gravure scientifique du 19e siècle montrant des expériences d'électricité, foudre, ou machines électriques"
Context: "Chapitre sur les découvertes du 19e siècle en électromagnétisme"
Sources: Gallica
```

**Analyse attendue** :
```json
{
  "analysis": {
    "type": "scientifique",
    "period": "19e siècle",
    "style": "gravure scientifique",
    "keywords": ["électricité", "expérience", "foudre", "machine"]
  },
  "sources": ["gallica"],
  "queries": {
    "gallica": "électricité expérience gravure 19e siècle"
  },
  "reasoning": "Illustrations scientifiques françaises du 19e → Gallica contient de nombreuses planches de traités scientifiques"
}
```

**Résultats espérés** :
- Planches de "Traité d'électricité" de Mascart
- Gravures d'expériences de Volta, Ampère
- Illustrations de machines électrostatiques

---

### 4. Formation entreprise sur le travail d'équipe

**Contexte** : Support de formation RH

#### Requête 4.1 : Équipe au travail
```
Intention: "Photo moderne d'une équipe diversifiée en train de collaborer autour d'une table"
Context: "Slide sur la collaboration en entreprise"
Sources: Unsplash, Pexels
```

**Résultats espérés** :
- Photos professionnelles mais naturelles
- Diversité visible (genre, âge, origine)
- Ambiance moderne et positive

---

### 5. Présentation sur le design thinking

**Contexte** : Workshop créatif

#### Requête 5.1 : Processus créatif
```
Intention: "Photo ou illustration abstraite évoquant la créativité, les idées, le brainstorming"
Context: "Introduction au design thinking"
Sources: Unsplash
```

**Query espérée par Claude** :
```
"creative process brainstorming abstract"
```

---

## Requêtes complexes à tester

### Test de nuance historique

```
Intention: "Carte ancienne de Paris au 18e siècle"
Context: "Présentation sur l'urbanisme historique"
```

**Analyse attendue** :
- Source prioritaire : Gallica (excellent fonds cartographique)
- Query Gallica : "carte paris 18e siècle plan"
- Type : "cartographie historique"

---

### Test de concept abstrait

```
Intention: "Image abstraite ou symbolique représentant le passage du temps"
Context: "Slide philosophique"
```

**Défi** : Concept abstrait difficile
**Analyse espérée** :
```json
{
  "sources": ["unsplash", "met"],
  "queries": {
    "unsplash": "time abstract clock sand",
    "met": "hourglass time clock painting"
  },
  "reasoning": "Concept abstrait → combiner photos modernes (Unsplash) et symbolisme classique (Met)"
}
```

---

### Test multi-période

```
Intention: "Évolution de la représentation de la lune dans l'art, de Galilée à nos jours"
Context: "Présentation astronomie et art"
```

**Défi** : Requête large temporellement
**Analyse espérée** :
```json
{
  "sources": ["gallica", "met", "unsplash"],
  "queries": {
    "gallica": "lune astronomie gravure galilée",
    "met": "moon astronomical drawing",
    "unsplash": "moon photography"
  },
  "reasoning": "Couverture temporelle large → combiner sources historiques (Gallica, Met) et modernes (Unsplash)"
}
```

---

## Cas limites à gérer

### Requête trop vague

```
Intention: "Une belle image"
Context: ""
```

**Comportement attendu** :
- Claude demande de préciser
- Ou retourne erreur : "Intention trop vague, merci de préciser le type d'illustration recherché"

---

### Requête impossible

```
Intention: "Photo de Napoléon prenant un selfie"
Context: "Présentation humoristique"
```

**Comportement attendu** :
- Analyse détecte l'anachronisme
- Suggère des alternatives :
  - "Portrait de Napoléon" (sources historiques)
  - "Recréation humoristique" (Unsplash avec mot-clé "napoleon costume")

---

### Requête avec sujet protégé

```
Intention: "Photo de Banksy en train de peindre"
Context: "Article sur le street art"
```

**Comportement attendu** :
- Détection que Banksy est anonyme et contemporain
- Suggère des alternatives :
  - "Street art graffiti" (Unsplash)
  - Œuvres de Banksy (mais vérifier droits d'auteur)

---

## Matrice de test : type de requête × source optimale

| Type de requête | Gallica | Met | Unsplash | Résultat attendu |
|---|---|---|---|---|
| "Gravure 18e siècle Paris" | ✓✓✓ | ✓ | ✗ | Priorité Gallica |
| "Peinture Renaissance italienne" | ✓ | ✓✓✓ | ✗ | Priorité Met |
| "Photo bureau moderne" | ✗ | ✗ | ✓✓✓ | Priorité Unsplash |
| "Portrait Victor Hugo" | ✓✓✓ | ✓ | ✗ | Priorité Gallica |
| "Nature morte classique" | ✓ | ✓✓✓ | ✗ | Priorité Met |
| "Paysage montagne contemporain" | ✗ | ✗ | ✓✓✓ | Priorité Unsplash |
| "Carte ancienne France" | ✓✓✓ | ✓ | ✗ | Priorité Gallica |
| "Sculpture grecque antique" | ✗ | ✓✓✓ | ✗ | Priorité Met |
| "Architecture moderne" | ✗ | ✓ | ✓✓✓ | Unsplash + Met |
| "Illustration scientifique 19e" | ✓✓✓ | ✓ | ✗ | Priorité Gallica |

**Légende** : ✓✓✓ = Optimal, ✓ = Bon, ✗ = Peu pertinent

---

## Scripts de test automatisés

### Script 1 : Tester toutes les sources

```typescript
// test/integration/all-sources.test.ts

const testQueries = [
  {
    intention: "landscape painting",
    expectedSources: ["met"],
    minResults: 3
  },
  {
    intention: "modern office workspace",
    expectedSources: ["unsplash"],
    minResults: 5
  },
  {
    intention: "gravure paris 18e siècle",
    expectedSources: ["gallica"],
    minResults: 2
  }
];

describe('All sources integration test', () => {
  testQueries.forEach(test => {
    it(`should find results for: ${test.intention}`, async () => {
      const results = await plugin.search({
        intention: test.intention,
        sources: test.expectedSources,
        limit: 5
      });
      
      expect(results.results.length).toBeGreaterThanOrEqual(test.minResults);
      expect(results.errors).toHaveLength(0);
    });
  });
});
```

---

### Script 2 : Vérifier analyse Claude

```typescript
// test/services/claude-analysis.test.ts

const analysisTests = [
  {
    input: {
      intention: "gravure scientifique 19e siècle",
      context: "histoire des sciences"
    },
    expected: {
      type: "scientifique",
      period: "19e siècle",
      primarySource: "gallica"
    }
  },
  {
    input: {
      intention: "modern startup team photo",
      context: "business presentation"
    },
    expected: {
      type: "moderne",
      primarySource: "unsplash"
    }
  }
];

describe('Claude intention analysis', () => {
  analysisTests.forEach(test => {
    it(`should correctly analyze: ${test.input.intention}`, async () => {
      const analysis = await claudeService.analyzeIntention(
        test.input.intention,
        test.input.context,
        ['met', 'unsplash', 'gallica']
      );
      
      expect(analysis.analysis.type).toBe(test.expected.type);
      if (test.expected.period) {
        expect(analysis.analysis.period).toContain(test.expected.period);
      }
      expect(analysis.sources[0]).toBe(test.expected.primarySource);
    });
  });
});
```

---

## Benchmark de performance

### Temps de réponse cibles

| Opération | Temps cible | Temps max acceptable |
|---|---|---|
| Analyse Claude | 2-4s | 8s |
| Recherche Met (5 résultats) | 2-4s | 10s |
| Recherche Unsplash (5 résultats) | 1-3s | 8s |
| Recherche Gallica (5 résultats) | 3-6s | 15s |
| Téléchargement image (2MB) | 1-3s | 10s |
| **Workflow complet** | **5-10s** | **20s** |

---

### Test de performance automatisé

```typescript
// test/performance/benchmark.test.ts

describe('Performance benchmarks', () => {
  it('should complete full workflow in < 20s', async () => {
    const startTime = Date.now();
    
    const results = await plugin.search({
      intention: "landscape painting",
      sources: ["met"],
      limit: 5
    });
    
    await plugin.downloadAndInsert(results.results[0]);
    
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(20000); // 20s max
    expect(results.results.length).toBeGreaterThan(0);
  });
  
  it('should handle 3 concurrent searches', async () => {
    const searches = [
      plugin.search({ intention: "painting", sources: ["met"], limit: 3 }),
      plugin.search({ intention: "photo", sources: ["unsplash"], limit: 3 }),
      plugin.search({ intention: "gravure", sources: ["gallica"], limit: 3 })
    ];
    
    const results = await Promise.all(searches);
    
    results.forEach(r => {
      expect(r.results.length).toBeGreaterThan(0);
    });
  });
});
```

---

## Données de résultats réels (pour validation)

### Exemple Met Museum : "landscape painting"

**Résultats réels obtenus** (via API en février 2026) :

```json
[
  {
    "title": "View of Haarlem with Bleaching Grounds",
    "artist": "Jacob van Ruisdael",
    "date": "ca. 1670–75",
    "department": "European Paintings",
    "imageUrl": "https://images.metmuseum.org/CRDImages/ep/original/DP146481.jpg"
  },
  {
    "title": "The Harvesters",
    "artist": "Pieter Bruegel the Elder",
    "date": "1565",
    "imageUrl": "https://images.metmuseum.org/CRDImages/ep/original/DT1853.jpg"
  }
]
```

Ces résultats peuvent servir de **baseline** pour vérifier que l'API fonctionne correctement.

---

## Checklist de validation finale

Avant de considérer le plugin prêt :

### Fonctionnel
- [ ] 10 requêtes de test différentes fonctionnent
- [ ] Chaque source retourne des résultats pertinents
- [ ] Analyse Claude correcte sur 8/10 cas
- [ ] Téléchargement et insertion sans erreur

### Qualité des résultats
- [ ] Pertinence > 70% (validation manuelle)
- [ ] Pas de résultats hors-sujet
- [ ] Licences correctement identifiées
- [ ] Attributions correctes

### Performance
- [ ] 90% des recherches < 15s
- [ ] Aucun freeze UI
- [ ] Cache réduit les temps de 50%

### Robustesse
- [ ] Gère 100% des erreurs sans crash
- [ ] Messages d'erreur clairs
- [ ] Retry fonctionne

---

#examples #test-cases #validation
