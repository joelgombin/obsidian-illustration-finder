---
type: project-index
project: obsidian-illustration-finder
status: ready-for-development
created: '2026-02-16'
---
# Index du projet - Illustration Finder Plugin

## 📁 Fichiers créés

Voici tous les fichiers de documentation créés pour le développement du plugin Obsidian Illustration Finder.

### Documentation principale

| Fichier | Description | Usage |
|---------|-------------|-------|
| **SPECS.md** | Spécifications techniques complètes | Référence principale pour Claude Code |
| **TASKS.md** | Checklist détaillée de développement | Plan de travail phase par phase |
| **TESTS.md** | Guide de tests et exemples | Setup Jest, tests unitaires et intégration |
| **TEST-CONFIG.md** | Configuration et données de test | Fixtures, mocks, scripts de test |
| **README.md** | Documentation utilisateur final | À publier avec le plugin |

### Skill de base

| Fichier | Description |
|---------|-------------|
| **Skills/Illustrations libres de droit.md** | Skill complète sur les sources d'illustrations |

---

## 🎯 Comment utiliser ces documents

### Pour développer avec Claude Code

**Étape 1 : Donner le contexte**
```
Consulte ces fichiers dans l'ordre :
1. Skills/Illustrations libres de droit.md (contexte général)
2. SPECS.md (architecture et implémentation)
3. TASKS.md (plan de travail)
```

**Étape 2 : Commencer le développement**
```
Développe le plugin Obsidian Illustration Finder en suivant 
TASKS.md. Commence par la Phase 0 (Setup) et avance phase 
par phase. Consulte SPECS.md pour les détails d'implémentation.
```

**Étape 3 : Tests**
```
Utilise TESTS.md pour créer les tests unitaires et 
TEST-CONFIG.md pour les fixtures et mocks.
```

### Pour comprendre le projet

**Vision d'ensemble** :
1. Lis d'abord **README.md** (vue utilisateur)
2. Puis **SPECS.md** section "Vue d'ensemble" (vue technique)

**Architecture** :
- Consulte **SPECS.md** sections "Architecture technique" et "Structure du projet"

**Fonctionnalités** :
- **SPECS.md** sections F1 à F7 (spécifications fonctionnelles détaillées)

---

## 📊 Structure des specs

### SPECS.md (principale)

```
Vue d'ensemble
├── Objectif
├── Stack technique
└── Architecture

Spécifications fonctionnelles (F1-F7)
├── F1: Commande de recherche
├── F2: Modal de recherche
├── F3: Analyse d'intention (Claude)
├── F4: Modal de résultats
├── F5: Services API
│   ├── MetMuseumService
│   ├── UnsplashService
│   └── GallicaService
├── F6: Téléchargement et insertion
└── F7: Paramètres

Spécifications techniques
├── Types TypeScript
├── Services détaillés
├── Gestion d'erreurs
└── Performance

Instructions développement
├── Setup
├── Ordre d'implémentation
└── Difficultés attendues

Roadmap
└── Phases 1-4
```

### TASKS.md (plan de travail)

```
Phase 0: Setup (30 min)
Phase 1: Types et Settings (1h)
Phase 2: Service Met Museum (2h)
Phase 3: Service Claude (2h)
Phase 4: Service Unsplash (1h30)
Phase 5: Service Gallica (2h)
Phase 6: Image Downloader (1h30)
Phase 7: Modal de recherche (1h)
Phase 8: Modal de résultats (2h)
Phase 9: Plugin principal (2h)
Phase 10: Polish (2h)
Phase 11: Tests et QA (2h)
Phase 12: Build et release (1h)

Total: ~17h30
```

---

## 🔑 Points clés du projet

### Objectif
Créer un plugin Obsidian qui permet de rechercher et insérer des illustrations libres de droit avec l'aide de Claude AI.

### Technologies
- **TypeScript** : Langage principal
- **Obsidian Plugin API** : Framework
- **Claude API** : Analyse d'intention
- **Met Museum API** : Art classique
- **Unsplash API** : Photos modernes
- **Jest** : Tests

### Workflow utilisateur
```
1. Utilisateur ouvre modal (Ctrl+Shift+I)
   ↓
2. Décrit son intention ("gravure scientifique 19e siècle")
   ↓
3. Claude analyse et choisit les meilleures sources
   ↓
4. Recherches API en parallèle
   ↓
5. Résultats affichés avec previews
   ↓
6. Utilisateur sélectionne → image téléchargée et insérée
```

### Architecture technique
```
src/
├── main.ts                 # Point d'entrée
├── settings.ts             # Configuration
├── modals/
│   ├── SearchModal.ts      # Modal recherche
│   ├── ResultsModal.ts     # Modal résultats
│   └── PreviewModal.ts     # Preview image
├── services/
│   ├── ClaudeService.ts    # Analyse intention
│   ├── MetMuseumService.ts # API Met
│   ├── UnsplashService.ts  # API Unsplash
│   ├── GallicaService.ts   # Recherche Gallica
│   └── ImageDownloader.ts  # Téléchargement
├── types/
│   └── types.ts            # Définitions TS
└── utils/
    ├── markdown.ts         # Utilitaires MD
    └── image.ts            # Utilitaires image
```

---

## 💡 Concepts clés

### Analyse d'intention par Claude

Claude reçoit :
- L'intention de l'utilisateur
- Le contexte optionnel
- La skill "Illustrations libres de droit"

Claude retourne :
```typescript
{
  analysis: {
    type: "historique" | "moderne" | "artistique"...,
    keywords: ["mot1", "mot2"]
  },
  sources: ["gallica", "met"],
  queries: {
    gallica: "gravure électricité 19e",
    met: "electricity illustration 19th"
  },
  reasoning: "Explication du choix"
}
```

### Résultats d'illustration

Format unifié pour toutes les sources :
```typescript
{
  id: string,
  source: "Metropolitan Museum" | "Unsplash" | "Gallica",
  title: string,
  imageUrl: string,        // Haute résolution
  thumbnailUrl: string,    // Preview
  sourceUrl: string,       // Lien vers source
  license: string,         // CC0, Unsplash License, etc.
  attribution: string,     // Texte pré-formaté
  metadata: {...}          // Données supplémentaires
}
```

---

## 📝 Exemples de code

### Recherche Met Museum

```typescript
const service = new MetMuseumService();
const results = await service.search('landscape', 5);

// results[0] = {
//   id: "436532",
//   source: "Metropolitan Museum",
//   title: "The Starry Night",
//   artist: "Vincent van Gogh",
//   ...
// }
```

### Analyse Claude

```typescript
const claude = new ClaudeService(apiKey);
const analysis = await claude.analyzeIntention(
  'Une gravure scientifique du 19e siècle',
  'Article sur l\'histoire de l\'électricité',
  ['met', 'gallica', 'unsplash']
);

// analysis.sources = ["gallica", "met"]
// analysis.queries.gallica = "gravure électricité 19e siècle"
```

### Insertion dans note

```typescript
const downloader = new ImageDownloader(app);
await downloader.downloadAndInsert({
  result: illustrationResult,
  targetFolder: 'Assets/Illustrations'
});

// Résultat dans la note :
// ![Titre](Assets/Illustrations/12345_met_titre.jpg)
// *Source: Metropolitan Museum (CC0)*
```

---

## 🧪 Tests

### Structure des tests

```
tests/
├── mocks/
│   └── obsidian.mock.ts     # Mock de l'API Obsidian
├── fixtures/
│   ├── met-museum-responses.ts
│   ├── unsplash-responses.ts
│   └── claude-responses.ts
├── services/
│   ├── MetMuseumService.test.ts
│   ├── ClaudeService.test.ts
│   └── ...
└── integration/
    └── full-workflow.test.ts
```

### Lancer les tests

```bash
# Tous les tests
npm test

# Avec coverage
npm run test:coverage

# Mode watch
npm run test:watch

# Test rapide des APIs
npm run test:quick
```

---

## 🚀 Quick Start pour Claude Code

**Commande complète** :

```
Je veux que tu développes le plugin Obsidian Illustration Finder.

1. Lis d'abord ces fichiers de documentation :
   - Projets/Obsidian Illustration Finder/SPECS.md
   - Projets/Obsidian Illustration Finder/TASKS.md
   - Skills/Illustrations libres de droit.md

2. Suis le plan de TASKS.md phase par phase :
   - Commence par Phase 0 (Setup)
   - Crée les tests en même temps que le code
   - Commit après chaque phase

3. Pour chaque service :
   - Implémente selon SPECS.md
   - Crée les tests selon TESTS.md
   - Utilise les fixtures de TEST-CONFIG.md

4. Respecte l'architecture TypeScript stricte
5. Vise 80%+ de coverage

Est-ce que tu as des questions avant de commencer ?
```

---

## 📋 Checklist avant développement

- [ ] Lire SPECS.md complètement
- [ ] Lire TASKS.md pour comprendre le plan
- [ ] Lire la skill "Illustrations libres de droit"
- [ ] Avoir accès aux APIs (clés)
- [ ] Avoir un vault Obsidian de test
- [ ] Node.js 18+ installé
- [ ] Comprendre l'architecture globale

---

## 🎓 Ressources complémentaires

### Documentation officielle
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Met Museum API](https://metmuseum.github.io/)
- [Unsplash API](https://unsplash.com/documentation)

### Dans ce projet
- **SPECS.md** : Toutes les spécifications détaillées
- **TESTS.md** : Guide complet des tests
- **TEST-CONFIG.md** : Configuration et fixtures
- **Skills/Illustrations libres de droit.md** : Sources et bonnes pratiques

---

## 📞 Support

Pour questions ou problèmes :
1. Consulter SPECS.md section "Dépannage"
2. Vérifier TESTS.md pour exemples
3. Lire les fixtures dans TEST-CONFIG.md
4. Créer une issue si nécessaire

---

## ✅ Validation finale

Avant de considérer le projet terminé :

**Code**
- [ ] Toutes les phases de TASKS.md complétées
- [ ] Tests passent (coverage > 80%)
- [ ] Build production fonctionne
- [ ] Pas d'erreurs TypeScript

**Fonctionnel**
- [ ] Toutes les features de SPECS.md implémentées
- [ ] Gestion d'erreurs robuste
- [ ] Performance acceptable (< 10s par recherche)
- [ ] UI responsive et accessible

**Documentation**
- [ ] README.md à jour
- [ ] Code commenté (JSDoc)
- [ ] CHANGELOG.md créé
- [ ] Exemples d'utilisation

---

*Index créé le 16 février 2026*
*Projet prêt pour développement*

#index #documentation #overview #obsidian
