---
type: test-guide
project: obsidian-illustration-finder
status: ready
created: '2026-02-16'
---
# Illustration Finder - Guide de test

## Installation pour test (développement)

### 1. Setup du projet

```bash
# Cloner et setup
git clone https://github.com/votre-repo/obsidian-illustration-finder.git
cd obsidian-illustration-finder
npm install

# Créer lien symbolique vers vault de test
ln -s $(pwd) /path/to/test-vault/.obsidian/plugins/illustration-finder

# Build en mode dev (watch)
npm run dev
```

### 2. Configuration des API Keys

Créer un fichier `.env` à la racine :

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-xxx
UNSPLASH_ACCESS_KEY=xxx
```

**Obtenir les clés** :
- **Anthropic** : https://console.anthropic.com/
- **Unsplash** : https://unsplash.com/developers (gratuit, 50 req/h)

### 3. Activer le plugin dans Obsidian

1. Ouvrir Obsidian
2. Settings → Community plugins → Désactiver le mode restreint
3. Recharger les plugins (Ctrl+R)
4. Activer "Illustration Finder"
5. Aller dans les settings du plugin
6. Coller les API keys

---

## Scénarios de test

### Test 1 : Recherche basique (Met Museum uniquement)

**Objectif** : Vérifier que la recherche Met Museum fonctionne

**Steps** :
1. Ouvrir une note
2. Cmd+P → "Illustration Finder: Rechercher"
3. Intention : `landscape painting`
4. Context : `Article about nature`
5. Sources : Cocher uniquement "Metropolitan Museum"
6. Nombre résultats : 5
7. Click "Rechercher"

**Résultat attendu** :
- Modal de résultats s'ouvre en < 10s
- 5 résultats affichés (ou moins si moins disponibles)
- Chaque résultat a : thumbnail, titre, artiste, date, source
- License affichée : "CC0"

**Vérifications** :
- [ ] Thumbnails chargent correctement
- [ ] Pas d'erreur dans la console
- [ ] Bouton "Insérer" fonctionne
- [ ] Image insérée dans la note avec attribution

---

### Test 2 : Recherche multi-sources

**Objectif** : Vérifier recherche simultanée sur plusieurs sources

**Steps** :
1. Intention : `coffee shop interior modern`
2. Sources : Met Museum + Unsplash
3. Nombre : 8

**Résultat attendu** :
- Résultats des deux sources mélangés
- Licences différentes : CC0 (Met) et Unsplash License
- Attributions différentes selon la source

**Vérifications** :
- [ ] Au moins un résultat de chaque source
- [ ] Résultats bien labellés par source
- [ ] Temps de réponse < 15s

---

### Test 3 : Analyse d'intention par Claude

**Objectif** : Vérifier que Claude analyse bien l'intention

**Cas de test** :

#### Cas 3a : Sujet historique français
```
Intention: "Une gravure du 18e siècle représentant la Révolution française"
Context: "Article sur l'histoire de France"
```

**Résultat attendu (via console.log de l'analyse)** :
```json
{
  "analysis": {
    "type": "historique",
    "period": "18e siècle",
    "keywords": ["révolution française", "gravure", "18e siècle"]
  },
  "sources": ["gallica", "met"],
  "queries": {
    "gallica": "révolution française gravure 18e",
    "met": "french revolution engraving"
  },
  "reasoning": "Sujet historique français → Gallica prioritaire"
}
```

**Vérifications** :
- [ ] Gallica est prioritaire
- [ ] Requête en français pour Gallica
- [ ] Type correctement identifié

#### Cas 3b : Photo moderne business
```
Intention: "Photo d'une équipe de startup en réunion"
Context: "Présentation sur l'entrepreneuriat"
```

**Résultat attendu** :
```json
{
  "sources": ["unsplash"],
  "queries": {
    "unsplash": "startup team meeting"
  }
}
```

**Vérifications** :
- [ ] Unsplash prioritaire (pas Met)
- [ ] Requête concise et pertinente

#### Cas 3c : Art classique
```
Intention: "Peinture impressionniste de paysage"
```

**Résultat attendu** :
```json
{
  "sources": ["met", "gallica"],
  "queries": {
    "met": "impressionist landscape painting",
    "gallica": "peinture impressionniste paysage"
  }
}
```

---

### Test 4 : Gestion d'erreurs

#### Test 4a : API key invalide

**Steps** :
1. Dans settings, mettre une API key Anthropic invalide
2. Lancer une recherche

**Résultat attendu** :
- Notice d'erreur claire : "Erreur Anthropic API : Invalid API key"
- Pas de crash du plugin
- Possibilité de corriger dans settings

#### Test 4b : Pas de résultats

**Steps** :
1. Intention : `xyzabc123notfound999`
2. Source : Met Museum

**Résultat attendu** :
- Modal de résultats s'ouvre
- Message : "Aucun résultat trouvé"
- Suggestion de reformuler la recherche

#### Test 4c : Une source échoue, l'autre fonctionne

**Steps** :
1. Déconnecter internet pendant 2 secondes après le lancement
2. Sources : Met + Unsplash

**Résultat attendu** :
- Résultats de la source qui a réussi s'affichent
- Notice : "Certaines sources n'ont pas répondu"
- Pas de crash

---

### Test 5 : Téléchargement et insertion

**Objectif** : Vérifier le workflow complet

**Steps** :
1. Recherche avec résultats
2. Click sur "Insérer" pour le premier résultat
3. Vérifier le dossier `Assets/Illustrations/`

**Vérifications** :
- [ ] Image téléchargée dans le bon dossier
- [ ] Nom de fichier : `timestamp_source_title.jpg`
- [ ] Markdown inséré au curseur
- [ ] Format : `![title](path)\n*attribution*`
- [ ] Image s'affiche dans la préview Obsidian
- [ ] Attribution correcte selon la source

---

### Test 6 : Settings et persistence

**Objectif** : Vérifier que les settings sont sauvegardés

**Steps** :
1. Modifier settings :
   - Dossier : `Images/Test/`
   - Nombre par défaut : 10
   - Décocher "Auto resize"
2. Fermer Obsidian
3. Rouvrir Obsidian
4. Vérifier les settings

**Vérifications** :
- [ ] Settings sauvegardés
- [ ] Dossier créé si n'existe pas
- [ ] Nouvelle recherche utilise les nouveaux settings

---

### Test 7 : Performance

**Objectif** : Vérifier les temps de réponse

**Mesures attendues** :
- Modal recherche s'ouvre : < 200ms
- Analyse Claude : 2-5s
- Recherche Met (5 résultats) : 2-4s
- Recherche Unsplash (5 résultats) : 1-3s
- Téléchargement image : 1-3s selon taille
- TOTAL workflow complet : < 15s

**Test de charge** :
1. Lancer 3 recherches simultanées
2. Vérifier qu'il n'y a pas de freeze UI

---

### Test 8 : Edge cases

#### Test 8a : Image très grande
**Steps** : Rechercher une image > 5MB
**Attendu** : Redimensionnement si option activée, sinon warning

#### Test 8b : Titre avec caractères spéciaux
**Steps** : Insérer image avec titre `L'œuvre d'été / été 1889`
**Attendu** : Filename sanitized : `timestamp_met_loeuvre-dete-ete-1889.jpg`

#### Test 8c : Dossier inexistant
**Steps** : Settings → dossier qui n'existe pas
**Attendu** : Dossier créé automatiquement

#### Test 8d : Vault en lecture seule
**Steps** : Permissions du vault en read-only
**Attendu** : Erreur claire, pas de crash

---

## Données de mock pour tests sans API

Créer un fichier `src/services/__mocks__/mockData.ts` :

```typescript
export const MOCK_MET_RESULTS = [
  {
    id: 1,
    title: "Landscape with a River",
    artist: "Claude Lorrain",
    date: "1645",
    imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT1507.jpg",
    thumbnailUrl: "https://images.metmuseum.org/CRDImages/ep/web-large/DT1507.jpg",
    objectUrl: "https://www.metmuseum.org/art/collection/search/437329",
    department: "European Paintings",
    medium: "Oil on canvas"
  },
  // ... plus de résultats
];

export const MOCK_UNSPLASH_RESULTS = [
  {
    id: "abc123",
    description: "Modern coffee shop interior",
    photographer: "John Doe",
    imageUrl: "https://images.unsplash.com/photo-xxx?w=1920",
    thumbnailUrl: "https://images.unsplash.com/photo-xxx?w=400",
    downloadUrl: "https://images.unsplash.com/photo-xxx?download",
    unsplashUrl: "https://unsplash.com/photos/abc123",
    color: "#c0b283"
  }
];

export const MOCK_CLAUDE_ANALYSIS = {
  analysis: {
    type: "moderne",
    period: null,
    style: "photographie",
    keywords: ["café", "intérieur", "moderne"]
  },
  sources: ["unsplash"],
  queries: {
    unsplash: "coffee shop interior modern"
  },
  reasoning: "Photo moderne d'intérieur → Unsplash optimal"
};
```

**Usage dans les tests** :

```typescript
// Activer le mode mock
if (process.env.USE_MOCKS === 'true') {
  jest.mock('./services/MetMuseumService');
  jest.mock('./services/UnsplashService');
}
```

---

## Checklist de test avant release

### Fonctionnel
- [ ] Recherche Met Museum fonctionne
- [ ] Recherche Unsplash fonctionne
- [ ] Recherche Gallica fonctionne (ou placeholder)
- [ ] Analyse Claude correcte sur 10 cas différents
- [ ] Insertion d'image fonctionne
- [ ] Attribution correcte pour chaque source

### Settings
- [ ] API keys sauvegardées de manière sécurisée
- [ ] Settings persistent après redémarrage
- [ ] Tous les paramètres fonctionnent
- [ ] Validation des inputs

### Erreurs
- [ ] API key invalide → message clair
- [ ] Pas de résultats → message approprié
- [ ] Timeout → retry ou message
- [ ] Erreur réseau → message clair
- [ ] Dossier inaccessible → erreur claire

### Performance
- [ ] Aucune recherche > 20s
- [ ] UI ne freeze jamais
- [ ] Cache fonctionne correctement
- [ ] Pas de memory leak

### UX
- [ ] Raccourcis clavier fonctionnent
- [ ] Modals responsive
- [ ] Thumbnails chargent en lazy
- [ ] Loading states clairs
- [ ] Messages d'erreur en français

### Mobile (optionnel Phase 1)
- [ ] Plugin se charge sur mobile
- [ ] Recherche fonctionne
- [ ] Insertion fonctionne
- [ ] Modals adaptés au tactile

---

## Commandes de test utiles

```bash
# Lancer le dev server
npm run dev

# Lancer les tests unitaires
npm test

# Lancer les tests avec coverage
npm run test:coverage

# Lancer les tests en watch mode
npm run test:watch

# Build production
npm run build

# Linter
npm run lint

# Format code
npm run format
```

---

## Debugging

### Activer les logs détaillés

Dans `src/main.ts`, ajouter :

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('[IllustrationFinder] Event:', eventName, data);
}
```

### Console Obsidian

- Ouvrir : `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Option+I` (Mac)
- Voir tous les logs du plugin
- Network tab pour voir les requêtes API

### Tester sans Obsidian

Créer un script standalone :

```typescript
// test-standalone.ts
import { ClaudeService } from './src/services/ClaudeService';

async function test() {
  const service = new ClaudeService(process.env.ANTHROPIC_API_KEY!);
  
  const analysis = await service.analyzeIntention(
    "Une gravure du 18e siècle",
    "",
    ["met", "gallica"]
  );
  
  console.log(JSON.stringify(analysis, null, 2));
}

test();
```

```bash
# Exécuter
npx tsx test-standalone.ts
```

---

## Problèmes connus et solutions

### Problème 1 : "Module not found: @anthropic-ai/sdk"
**Solution** : `npm install @anthropic-ai/sdk`

### Problème 2 : Met Museum API retourne objets sans images
**Solution** : Filtrer les résultats : `results.filter(r => r.primaryImage)`

### Problème 3 : Unsplash rate limit dépassé
**Solution** : Implémenter un cache ou attendre 1h

### Problème 4 : CORS errors
**Solution** : Les requêtes passent par Electron (Obsidian), pas de CORS

### Problème 5 : Plugin ne se recharge pas
**Solution** : 
- Ctrl+R pour reload Obsidian
- Ou désactiver/réactiver le plugin

---

## Exemple de session de test complète

```bash
# 1. Setup
cd obsidian-illustration-finder
npm install
npm run dev

# 2. Ouvrir Obsidian vault de test
# 3. Activer le plugin

# 4. Créer une note de test
touch test-illustrations.md

# 5. Test basique
- Cmd+P → "Illustration Finder"
- Intention: "landscape painting"
- Source: Met Museum
- Insérer une image

# 6. Vérifier
- Image dans Assets/Illustrations/
- Markdown correct dans la note
- Preview affiche l'image

# 7. Test avancé
- Intention: "gravure scientifique électricité 19e siècle"
- Sources: Met + Gallica
- Vérifier analyse Claude (console)
- Comparer pertinence des résultats

# 8. Test d'erreur
- Mettre API key invalide
- Vérifier message d'erreur
- Corriger API key
- Réessayer

# 9. Test performance
- Chronométrer 5 recherches
- Moyenne < 10s ?

# 10. Commit si OK
git add .
git commit -m "feat: basic search working"
```

---

## Ressources de test

### Images de test
- **Met Museum** : https://www.metmuseum.org/art/collection/search?showOnly=openAccess
- **Unsplash** : https://unsplash.com/

### Comptes API gratuits
- **Anthropic** : 5$ de crédit offerts à l'inscription
- **Unsplash** : 50 req/h gratuit

### Vault Obsidian de test
Créer un vault minimal avec :
```
test-vault/
├── .obsidian/
│   └── plugins/
│       └── illustration-finder/ → symlink
├── Assets/
│   └── Illustrations/
├── test-note.md
└── test-presentation.md
```

---

#test #développement #qa
