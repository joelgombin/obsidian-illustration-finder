---
type: documentation
project: obsidian-illustration-finder
audience: end-users
created: '2026-02-16'
---
# README - Illustration Finder for Obsidian

> Recherchez et insérez des illustrations libres de droit directement dans vos notes Obsidian, avec l'aide de l'IA Claude.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

- 🔍 **Recherche intelligente** : Décrivez simplement ce que vous voulez, Claude comprend votre intention
- 🎨 **Sources multiples** : Metropolitan Museum (492K+ œuvres), Unsplash (photos modernes), Gallica (patrimoine français)
- 📝 **Insertion automatique** : L'image est téléchargée et insérée avec l'attribution correcte
- ⚡ **Rapide** : Résultats en quelques secondes
- 🆓 **100% gratuit** : Toutes les images sont libres de droit (CC0, domaine public)

## 🚀 Installation

### Via Community Plugins (recommandé)

1. Ouvrez Obsidian
2. Allez dans **Settings** → **Community plugins** → **Browse**
3. Recherchez "**Illustration Finder**"
4. Cliquez sur **Install**, puis **Enable**

### Installation manuelle

1. Téléchargez la dernière release depuis [GitHub](https://github.com/joelgombin/obsidian-illustration-finder/releases)
2. Extrayez le fichier ZIP dans votre dossier `.obsidian/plugins/`
3. Redémarrez Obsidian
4. Activez le plugin dans **Settings** → **Community plugins**

## ⚙️ Configuration

### 1. Clé API Anthropic (requis)

Pour utiliser l'analyse intelligente des intentions, vous devez configurer une clé API Anthropic :

1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générez une clé API
3. Dans Obsidian : **Settings** → **Illustration Finder** → collez votre clé

**Note** : Les 5 premiers crédits sont gratuits, puis ~$0.003 par recherche.

### 2. Clé API Unsplash (optionnel)

Pour rechercher des photos modernes :

1. Créez un compte sur [unsplash.com/developers](https://unsplash.com/developers)
2. Créez une application
3. Copiez votre Access Key
4. Dans Obsidian : **Settings** → **Illustration Finder** → collez la clé

**Note** : 50 requêtes/heure en gratuit.

### 3. Paramètres

- **Dossier des illustrations** : Où sauvegarder les images (défaut : `Assets/Illustrations`)
- **Redimensionner** : Redimensionner automatiquement les images (recommandé)
- **Attribution** : Inclure l'attribution dans la note (recommandé pour respect des licences)

## 📖 Utilisation

### Recherche basique

1. Placez votre curseur où vous voulez l'image
2. Ouvrez la palette de commandes (`Ctrl/Cmd + P`)
3. Tapez "**Illustration Finder**" et sélectionnez la commande
4. Décrivez votre intention :
   ```
   Une gravure scientifique du 19e siècle sur l'électricité
   ```
5. Choisissez une image dans les résultats
6. L'image est insérée automatiquement !

### Raccourci clavier

Par défaut : `Ctrl/Cmd + Shift + I`

Personnalisable dans **Settings** → **Hotkeys** → **Illustration Finder**

### Exemples de recherches

**Art historique** :
```
Portrait Renaissance italienne
```
→ Recherchera dans Metropolitan Museum

**Science ancienne** :
```
Gravure anatomique planche botanique
```
→ Recherchera dans Gallica et Met Museum

**Photo moderne** :
```
Bureau moderne avec plantes
```
→ Recherchera dans Unsplash

**Abstrait/Conceptuel** :
```
Illustration ironique du temps qui passe
```
→ Claude choisira les meilleures sources selon le contexte

## 🎯 Sources disponibles

| Source | Type | Nombre d'œuvres | Licence |
|--------|------|-----------------|---------|
| **Metropolitan Museum** | Art classique, antiquités | 492 000+ | CC0 (domaine public) |
| **Unsplash** | Photos modernes | Millions | Unsplash License |
| **Gallica (BnF)** | Patrimoine français | Millions | Domaine public |

### Quand utiliser quelle source ?

- **Art classique, peintures, sculptures** → Met Museum
- **Photos modernes, lifestyle, tech** → Unsplash  
- **Patrimoine français, gravures anciennes, cartes** → Gallica
- **Pas sûr ?** → Laissez Claude choisir !

## 💡 Conseils d'utilisation

### Soyez spécifique

❌ Mauvais : "Une image de nature"
✅ Bon : "Paysage de montagne enneigée au lever du soleil"

### Donnez du contexte

Utilisez le champ "Contexte" pour affiner :
```
Intention : Illustration scientifique cerveau
Contexte : Article sur les neurosciences pour étudiants
```

### Vérifiez l'attribution

Même si les images sont libres de droit, il est recommandé de garder l'attribution pour :
- Respecter le travail des artistes/photographes
- Tracer la source de vos images
- Respecter les bonnes pratiques académiques

## 🔧 Dépannage

### "Erreur : API key invalide"

- Vérifiez que votre clé Anthropic est correcte
- Vérifiez que vous avez encore des crédits
- Essayez de régénérer une nouvelle clé

### "Aucun résultat trouvé"

- Essayez une recherche plus générale
- Vérifiez votre connexion internet
- Essayez une autre source
- Reformulez votre intention

### "Les images ne se téléchargent pas"

- Vérifiez les permissions du dossier de destination
- Vérifiez l'espace disque disponible
- Essayez de changer le dossier dans les paramètres

### Performance lente

- Réduisez le nombre de résultats demandés
- Désactivez le cache si problème de mémoire
- Vérifiez votre connexion internet

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

## 📝 Changelog

### v1.0.0 (2026-02-16)

- 🎉 Release initiale
- ✨ Recherche Met Museum
- ✨ Recherche Unsplash
- ✨ Analyse d'intention par Claude
- ✨ Insertion automatique avec attribution
- ⚙️ Configuration des paramètres

## 📄 Licence

MIT License - voir [LICENSE](LICENSE)

## 🙏 Remerciements

- [Metropolitan Museum](https://www.metmuseum.org/) pour leur incroyable collection en open access
- [Unsplash](https://unsplash.com/) pour leurs magnifiques photos
- [Gallica (BnF)](https://gallica.bnf.fr/) pour la numérisation du patrimoine français
- [Anthropic](https://www.anthropic.com/) pour l'API Claude

## 📞 Support

- 🐛 **Bugs** : [GitHub Issues](https://github.com/joelgombin/obsidian-illustration-finder/issues)
- 💬 **Questions** : [Discussions](https://github.com/joelgombin/obsidian-illustration-finder/discussions)

---

**Fait avec ❤️ pour la communauté Obsidian**
