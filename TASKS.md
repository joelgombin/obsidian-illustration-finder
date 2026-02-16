---
type: tasks
project: obsidian-illustration-finder
status: ready
estimated-hours: 17.5
created: '2026-02-16'
---
# Tasks - Illustration Finder Plugin Development

## Phase 0 : Setup (30 min)

- [ ] Créer le projet depuis le template Obsidian
  ```bash
  git clone https://github.com/obsidianmd/obsidian-sample-plugin.git obsidian-illustration-finder
  cd obsidian-illustration-finder
  npm install
  ```

- [ ] Installer dépendances supplémentaires
  ```bash
  npm install @anthropic-ai/sdk
  npm install --save-dev jest @types/jest ts-jest
  npm install --save-dev @testing-library/jest-dom
  ```

- [ ] Créer structure de dossiers
  ```bash
  mkdir -p src/modals
  mkdir -p src/services  
  mkdir -p src/types
  mkdir -p src/utils
  mkdir -p tests/mocks
  mkdir -p tests/fixtures
  mkdir -p tests/services
  mkdir -p tests/integration
  ```

- [ ] Configurer TypeScript (vérifier tsconfig.json)
- [ ] Configurer Jest (créer jest.config.js)
- [ ] Modifier manifest.json avec les bonnes infos
- [ ] Créer lien symbolique vers vault de test
  ```bash
  ln -s $(pwd) /path/to/test-vault/.obsidian/plugins/illustration-finder
  ```

---

## Phase 1 : Types et Settings (1h)

### Types de base

- [ ] Créer `src/types/types.ts`
  - [ ] Interface `IllustrationResult`
  - [ ] Interface `IntentionAnalysis`
  - [ ] Interface `SearchParams`
  - [ ] Interface `SearchResults`
  - [ ] Interface `SearchError`
  - [ ] Type unions pour sources

### Settings

- [ ] Créer `src/settings.ts`
  - [ ] Interface `IllustrationFinderSettings`
  - [ ] Constante `DEFAULT_SETTINGS`
  - [ ] Classe `SettingsTab extends PluginSettingTab`
  - [ ] Méthode `display()` pour UI settings
  - [ ] Gestion sauvegarde/chargement settings

- [ ] Tester settings
  - [ ] Ouvrir Obsidian
  - [ ] Vérifier que settings s'affichent
  - [ ] Modifier une valeur
  - [ ] Redémarrer et vérifier persistance

---

## Phase 2 : Service Met Museum (2h)

### Implémentation

- [ ] Créer `src/services/MetMuseumService.ts`
  - [ ] Méthode `search(query: string, limit: number)`
  - [ ] Méthode privée `getObjectDetails(objectId: number)`
  - [ ] Méthode privée `parseObject(apiObject: any)`
  - [ ] Gestion timeout (10s)
  - [ ] Gestion erreurs réseau
  - [ ] Rate limiting (max 5 concurrent)

### Tests

- [ ] Créer fixtures `tests/fixtures/met-museum-responses.ts`
- [ ] Créer `tests/services/MetMuseumService.test.ts`
  - [ ] Test : recherche avec résultats
  - [ ] Test : recherche vide
  - [ ] Test : filtrage objets sans image
  - [ ] Test : respect de limit
  - [ ] Test : gestion erreurs API
  - [ ] Test : parsing correct des données
  - [ ] Test : génération attribution

- [ ] Lancer tests : `npm test -- MetMuseumService.test.ts`
- [ ] Vérifier coverage > 80%

### Test manuel

- [ ] Créer script de test standalone
  ```typescript
  // tests/manual/met-test.ts
  const service = new MetMuseumService();
  const results = await service.search('landscape', 3);
  console.log(results);
  ```
- [ ] Exécuter et vérifier résultats

---

## Phase 3 : Service Claude (2h)

### Implémentation

- [ ] Créer `src/services/ClaudeService.ts`
  - [ ] Constructeur avec API key
  - [ ] Méthode `loadSkillContent()` pour lire la skill
  - [ ] Méthode `analyzeIntention()`
  - [ ] Prompt système complet (voir specs)
  - [ ] Parsing JSON de la réponse
  - [ ] Retry logic (max 2 fois) si JSON invalide
  - [ ] Fallback simple si échec total
  - [ ] Timeout 30s

### Tests

- [ ] Créer fixtures `tests/fixtures/claude-responses.ts`
- [ ] Créer `tests/services/ClaudeService.test.ts`
  - [ ] Test : analyse intention historique
  - [ ] Test : analyse intention moderne
  - [ ] Test : retry sur JSON invalide
  - [ ] Test : fallback après max retries
  - [ ] Test : inclusion skill dans prompt
  - [ ] Test : timeout
  - [ ] Test : gestion erreurs API

- [ ] Lancer tests
- [ ] Vérifier coverage > 80%

### Test manuel

- [ ] Tester avec vraie API key
- [ ] Tester différentes intentions
- [ ] Vérifier qualité des suggestions de sources

---

## Phase 4 : Service Unsplash (1h30)

### Implémentation

- [ ] Créer `src/services/UnsplashService.ts`
  - [ ] Méthode `search(query: string, limit: number)`
  - [ ] Méthode privée `parsePhoto(apiPhoto: any)`
  - [ ] Headers avec API key
  - [ ] Gestion rate limiting (429)
  - [ ] Timeout 10s

### Tests

- [ ] Créer fixtures `tests/fixtures/unsplash-responses.ts`
- [ ] Créer `tests/services/UnsplashService.test.ts`
  - [ ] Test : recherche avec résultats
  - [ ] Test : API key dans headers
  - [ ] Test : parsing photos
  - [ ] Test : génération attribution
  - [ ] Test : gestion rate limiting

- [ ] Lancer tests
- [ ] Coverage > 80%

---

## Phase 5 : Service Gallica (2h)

**Note** : Gallica est complexe. Pour MVP, on peut commencer par un placeholder.

### Option A : MVP Simple (recommandé pour v1)

- [ ] Créer `src/services/GallicaService.ts`
  - [ ] Retourner array vide avec TODO
  - [ ] Logger la query pour debugging
  - [ ] Retourner erreur explicite

### Option B : Implémentation complète (v2)

- [ ] Utiliser API SRU de Gallica (XML)
- [ ] Parser les réponses XML
- [ ] Construire URLs IIIF
- [ ] Tester avec différentes queries

**Pour MVP : choisir Option A**

---

## Phase 6 : Image Downloader (1h30)

### Implémentation

- [ ] Créer `src/utils/image.ts` (utilitaires image)
  - [ ] Fonction sanitization filename
  - [ ] Fonction génération timestamp

- [ ] Créer `src/services/ImageDownloader.ts`
  - [ ] Méthode `downloadAndInsert(options)`
  - [ ] Méthode `downloadImage(url)`
  - [ ] Méthode `generateFilename(result)`
  - [ ] Méthode `generateMarkdown(result, filepath)`
  - [ ] Redimensionnement optionnel
  - [ ] Sauvegarde dans vault
  - [ ] Insertion dans éditeur actif

### Tests

- [ ] Créer `tests/services/ImageDownloader.test.ts`
  - [ ] Test : téléchargement et sauvegarde
  - [ ] Test : génération filename unique
  - [ ] Test : génération markdown correct
  - [ ] Test : gestion erreurs réseau
  - [ ] Test : vérification permissions vault

- [ ] Lancer tests
- [ ] Coverage > 80%

---

## Phase 7 : Modal de recherche (1h)

### Implémentation

- [ ] Créer `src/modals/SearchModal.ts`
  - [ ] Classe `SearchModal extends Modal`
  - [ ] Champ textarea "Intention"
  - [ ] Champ textarea "Contexte"
  - [ ] Checkboxes sources
  - [ ] Input nombre résultats
  - [ ] Bouton "Rechercher"
  - [ ] Validation formulaire
  - [ ] Focus automatique
  - [ ] Gestion Enter/ESC

### Styling

- [ ] Créer/modifier `styles.css`
  - [ ] Styles pour modal
  - [ ] Styles pour form
  - [ ] Responsive
  - [ ] Dark mode compatible

### Test manuel

- [ ] Ouvrir modal
- [ ] Tester validation
- [ ] Tester raccourcis clavier
- [ ] Vérifier apparence light/dark mode

---

## Phase 8 : Modal de résultats (2h)

### Implémentation

- [ ] Créer `src/modals/ResultsModal.ts`
  - [ ] Classe `ResultsModal extends Modal`
  - [ ] Grid de résultats
  - [ ] Thumbnails lazy loading
  - [ ] Bouton "Prévisualiser"
  - [ ] Bouton "Insérer"
  - [ ] Scroll pour > 6 résultats
  - [ ] Message si aucun résultat

### Preview modal

- [ ] Créer `src/modals/PreviewModal.ts`
  - [ ] Afficher image en grand
  - [ ] Métadonnées
  - [ ] Bouton "Insérer"
  - [ ] Bouton "Fermer"

### Styling

- [ ] Ajouter styles dans `styles.css`
  - [ ] Grid layout
  - [ ] Card design
  - [ ] Hover effects
  - [ ] Loading states

### Test manuel

- [ ] Afficher résultats
- [ ] Tester scroll
- [ ] Tester preview
- [ ] Tester insertion

---

## Phase 9 : Plugin principal (2h)

### Implémentation

- [ ] Modifier `src/main.ts`
  - [ ] Classe `IllustrationFinderPlugin extends Plugin`
  - [ ] Méthode `onload()`
  - [ ] Méthode `loadSettings()`
  - [ ] Méthode `saveSettings()`
  - [ ] Commande "Rechercher illustration"
  - [ ] Méthode `executeSearch(params)`
  - [ ] Orchestration des services
  - [ ] Gestion erreurs globale

### Workflow complet

- [ ] Méthode `openSearchModal()`
- [ ] Callback submit → `executeSearch()`
- [ ] Analyse Claude → recherches API (parallèle)
- [ ] Agrégation résultats
- [ ] Affichage modal résultats
- [ ] Sélection → téléchargement → insertion

### Tests d'intégration

- [ ] Créer `tests/integration/full-workflow.test.ts`
  - [ ] Test : workflow complet
  - [ ] Test : gestion échecs partiels
  - [ ] Test : timeout global
  - [ ] Test : annulation utilisateur

---

## Phase 10 : Polish et finalisation (2h)

### Notifications

- [ ] Loading states clairs
- [ ] Notices succès/erreur
- [ ] Messages d'erreur explicites
- [ ] Progress indicators

### Gestion d'erreurs

- [ ] Try/catch partout
- [ ] Logging console pour debug
- [ ] Messages utilisateur friendly
- [ ] Pas de crash sur erreur

### Performance

- [ ] Cache des résultats (optionnel v1)
- [ ] Lazy loading thumbnails
- [ ] Debounce recherches
- [ ] Optimisation bundles

### Documentation code

- [ ] JSDoc sur toutes les méthodes publiques
- [ ] Commentaires pour logique complexe
- [ ] Types bien définis partout

---

## Phase 11 : Tests et QA (2h)

### Tests automatisés

- [ ] Lancer suite complète : `npm test`
- [ ] Vérifier coverage : `npm run test:coverage`
- [ ] Fixer tests échouants
- [ ] Coverage global > 80%

### Tests manuels (checklist)

#### Recherche basique
- [ ] Recherche simple "landscape"
- [ ] Résultats s'affichent
- [ ] Thumbnails chargent
- [ ] Insertion fonctionne
- [ ] Attribution correcte

#### Sources multiples
- [ ] Activer Met + Unsplash
- [ ] Vérifier résultats mixtes
- [ ] Vérifier tri

#### Gestion erreurs
- [ ] Sans API key → message clair
- [ ] API key invalide → message clair
- [ ] Recherche vide → message
- [ ] Erreur réseau → retry ou message

#### Edge cases
- [ ] Caractères spéciaux dans recherche
- [ ] Recherche très longue
- [ ] Limit = 1
- [ ] Limit = 20
- [ ] Multiples insertions rapides

#### Performance
- [ ] Recherche < 10s
- [ ] UI ne freeze pas
- [ ] Memory leaks (DevTools)

#### Compatibilité
- [ ] Theme light
- [ ] Theme dark
- [ ] Différentes tailles fenêtre
- [ ] Mobile (si supporté)

---

## Phase 12 : Build et release (1h)

### Build production

- [ ] Nettoyer console.log
- [ ] Vérifier pas de TODO critiques
- [ ] Build : `npm run build`
- [ ] Vérifier taille bundle
- [ ] Minification OK

### Documentation

- [ ] README.md complet
- [ ] CHANGELOG.md
- [ ] LICENSE
- [ ] Screenshots pour README

### Release

- [ ] Git tag version
- [ ] GitHub release
- [ ] Package plugin (main.js, manifest.json, styles.css)
- [ ] Tester installation manuelle
- [ ] (Optionnel) Soumettre à community plugins

---

## Checklist finale

### Code
- [ ] Tous les tests passent
- [ ] Coverage > 80%
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de console.log en prod
- [ ] Code formatté (Prettier)

### Fonctionnel
- [ ] Toutes les features marchent
- [ ] Gestion erreurs robuste
- [ ] Performance acceptable
- [ ] Compatible light/dark mode

### Documentation
- [ ] README utilisateur
- [ ] README développeur
- [ ] Commentaires code
- [ ] SPECS à jour

### Release
- [ ] Version dans manifest.json
- [ ] CHANGELOG.md
- [ ] Git tags
- [ ] GitHub release

---

## Estimation totale

- **Setup** : 30 min
- **Types & Settings** : 1h
- **Services** : 6h (Met 2h, Claude 2h, Unsplash 1h30, Image 1h30)
- **Modals** : 3h
- **Plugin principal** : 2h
- **Polish** : 2h
- **Tests & QA** : 2h
- **Build & Release** : 1h

**Total** : ~17h30 de développement

---

## Notes pour Claude Code

### Ordre recommandé strict

1. ✅ Setup complet d'abord
2. ✅ Types avant tout le reste
3. ✅ Settings pour pouvoir tester
4. ✅ Un service à la fois, avec tests
5. ✅ Modals après services
6. ✅ Plugin principal en dernier
7. ✅ Polish et tests finaux

### À chaque étape

- Commit Git après chaque phase
- Lancer tests avant de passer à la suite
- Tester manuellement si possible
- Documenter au fur et à mesure

### Si bloqué

- Consulter SPECS.md pour détails
- Consulter TESTS.md pour exemples
- Consulter skill Illustrations pour contexte
- Créer issue pour discussion

---

*Checklist créée le 16 février 2026*
*Prête pour développement par Claude Code*

#tasks #checklist #development #obsidian
