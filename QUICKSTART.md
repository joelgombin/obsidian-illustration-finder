---
type: setup-guide
project: obsidian-illustration-finder
created: '2026-02-16'
---
# Quick Start - Configuration de test

## Setup rapide (5 minutes)

### 1. Créer le projet

```bash
# Option A : Depuis le template Obsidian
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git obsidian-illustration-finder
cd obsidian-illustration-finder

# Option B : Nouveau projet from scratch
mkdir obsidian-illustration-finder
cd obsidian-illustration-finder
npm init -y
```

### 2. Installer les dépendances

```bash
npm install --save-dev \
  @types/node \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  builtin-modules \
  esbuild \
  obsidian \
  tslib \
  typescript

npm install @anthropic-ai/sdk
```

### 3. Créer les fichiers de base

#### package.json
```json
{
  "name": "obsidian-illustration-finder",
  "version": "1.0.0",
  "description": "Recherchez et insérez des illustrations libres de droit avec Claude AI",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "test": "jest",
    "lint": "eslint . --ext .ts"
  },
  "keywords": ["obsidian", "plugin", "illustrations", "ai"],
  "author": "Votre nom",
  "license": "MIT"
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES2020",
    "allowJs": true,
    "noImplicitAny": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": ["DOM", "ES5", "ES6", "ES7"],
    "skipLibCheck": true
  },
  "include": ["**/*.ts"]
}
```

#### manifest.json
```json
{
  "id": "illustration-finder",
  "name": "Illustration Finder",
  "version": "1.0.0",
  "minAppVersion": "1.0.0",
  "description": "Recherchez et insérez des illustrations libres de droit avec l'aide de Claude AI",
  "author": "Votre nom",
  "authorUrl": "https://votre-site.com",
  "fundingUrl": "https://buymeacoffee.com/votrepseudo",
  "isDesktopOnly": false
}
```

#### .env (NE PAS COMMIT)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ICI
UNSPLASH_ACCESS_KEY=VOTRE_CLE_UNSPLASH_ICI
```

#### .gitignore
```
# Build
main.js
*.js.map
node_modules/

# Obsidian
.obsidian/

# Env
.env
.env.local

# Tests
coverage/

# OS
.DS_Store
Thumbs.db
```

---

## Configuration Obsidian vault de test

### 1. Créer un vault minimal

```bash
# Créer structure
mkdir -p test-vault/.obsidian/plugins
mkdir -p test-vault/Assets/Illustrations
mkdir -p test-vault/Notes

# Créer lien symbolique
ln -s $(pwd) test-vault/.obsidian/plugins/illustration-finder
```

### 2. Créer notes de test

#### test-vault/Notes/test-basique.md
```markdown
# Test recherche basique

## Test 1 : Art classique
<!-- Placer le curseur ici et tester recherche Met Museum -->

## Test 2 : Photo moderne
<!-- Placer le curseur ici et tester recherche Unsplash -->

## Test 3 : Patrimoine français
<!-- Placer le curseur ici et tester recherche Gallica -->
```

#### test-vault/Notes/test-presentation.md
```markdown
# Présentation : Histoire de l'IA

## Introduction
<!-- Chercher : "automate mécanique 18e siècle" -->

## L'ère moderne
<!-- Chercher : "data center servers modern" -->

## Conclusion
<!-- Chercher : "futuristic ai abstract" -->
```

---

## Fichier de configuration de développement

#### .vscode/settings.json
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/*.js": true,
    "**/*.js.map": true
  }
}
```

#### .vscode/launch.json (pour debug)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Scripts de test rapides

### test-met.sh (Test Met Museum API)
```bash
#!/bin/bash
echo "Testing Met Museum API..."

# Test search endpoint
curl -s "https://collectionapi.metmuseum.org/public/collection/v1/search?q=landscape&hasImages=true&isPublicDomain=true" | jq '.total'

# Get first object
OBJECT_ID=$(curl -s "https://collectionapi.metmuseum.org/public/collection/v1/search?q=landscape&hasImages=true&isPublicDomain=true" | jq '.objectIDs[0]')

echo "First object ID: $OBJECT_ID"

# Get object details
curl -s "https://collectionapi.metmuseum.org/public/collection/v1/objects/$OBJECT_ID" | jq '{title, artist: .artistDisplayName, date: .objectDate, image: .primaryImageSmall}'
```

### test-claude.ts (Test Claude API)
```typescript
import Anthropic from '@anthropic-ai/sdk';

async function testClaude() {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Analyse cette intention de recherche d'illustration :

Intention: "Une gravure scientifique du 19e siècle"
Context: "Article sur l'histoire des sciences"

Retourne uniquement un JSON avec :
{
  "sources": ["gallica", "met"],
  "queries": {
    "gallica": "gravure scientifique 19e siècle",
    "met": "scientific engraving 19th century"
  },
  "reasoning": "Explication brève"
}`
    }]
  });

  console.log(JSON.stringify(message.content[0], null, 2));
}

testClaude();
```

Exécuter :
```bash
npx tsx test-claude.ts
```

---

## Premiers tests manuels

### Test 1 : Vérifier APIs

```bash
# 1. Test Met Museum
curl "https://collectionapi.metmuseum.org/public/collection/v1/search?q=cat&hasImages=true" | jq '.total'

# 2. Test Anthropic (avec votre clé)
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# 3. Test Unsplash (avec votre clé)
curl "https://api.unsplash.com/search/photos?query=nature&per_page=3" \
  -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY"
```

### Test 2 : Build et chargement

```bash
# Build
npm run dev

# Dans un autre terminal, surveiller les changements
watch -n 1 ls -lh main.js
```

### Test 3 : Première recherche dans Obsidian

1. Ouvrir `test-vault` dans Obsidian
2. Settings → Community plugins → Désactiver mode restreint
3. Recharger (`Ctrl/Cmd+R`)
4. Activer "Illustration Finder"
5. Ouvrir Settings du plugin
6. Coller API keys
7. Ouvrir `test-basique.md`
8. `Ctrl+Shift+I` → Tester recherche

---

## Checklist setup complet

### Environnement
- [ ] Node.js 18+ installé
- [ ] Git configuré
- [ ] Éditeur (VS Code recommandé)
- [ ] Obsidian installé

### Projet
- [ ] Dépendances npm installées
- [ ] TypeScript configuré
- [ ] Build fonctionne (`npm run build`)
- [ ] Lien symbolique vers vault créé

### API Keys
- [ ] Clé Anthropic obtenue et testée
- [ ] Clé Unsplash obtenue (optionnel)
- [ ] Fichier .env créé (et dans .gitignore)
- [ ] Keys testées avec curl

### Vault de test
- [ ] Vault créé avec structure de base
- [ ] Notes de test créées
- [ ] Plugin activé dans Obsidian
- [ ] Settings configurées

### Vérification finale
- [ ] `npm run dev` démarre sans erreur
- [ ] Obsidian charge le plugin
- [ ] Modal de recherche s'ouvre
- [ ] Première recherche fonctionne
- [ ] Image s'insère dans note

---

## Commandes utiles

```bash
# Développement
npm run dev              # Build en mode watch
npm run build            # Build production
npm test                 # Lancer tests
npm run lint             # Vérifier le code

# Obsidian
# Ctrl/Cmd+R             # Recharger Obsidian
# Ctrl/Cmd+Shift+I       # Console développeur
# Ctrl+P                 # Palette de commandes

# Git
git status               # Voir changements
git add .                # Ajouter fichiers
git commit -m "message"  # Commit
git push                 # Push vers remote
```

---

## Troubleshooting setup

### "Cannot find module '@anthropic-ai/sdk'"
```bash
npm install @anthropic-ai/sdk
```

### "esbuild not found"
```bash
npm install --save-dev esbuild
```

### "Plugin doesn't load in Obsidian"
```bash
# Vérifier que manifest.json existe
ls manifest.json

# Vérifier que main.js est généré
npm run build
ls main.js

# Vérifier le lien symbolique
ls -la test-vault/.obsidian/plugins/
```

### "API key invalid"
```bash
# Vérifier format de la clé
echo $ANTHROPIC_API_KEY  # Doit commencer par sk-ant-api03-

# Tester directement
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

---

## Prochaines étapes

Une fois le setup validé :

1. ✅ **Implémenter les services** (MetMuseumService, ClaudeService, etc.)
2. ✅ **Créer les modals** (SearchModal, ResultsModal)
3. ✅ **Intégrer le workflow complet**
4. ✅ **Tester sur cas réels**
5. ✅ **Polir l'UX**

Voir [SPECS.md](SPECS.md) pour les détails d'implémentation.

---

#setup #quickstart #configuration
