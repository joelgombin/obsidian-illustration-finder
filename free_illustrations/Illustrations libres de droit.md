---
type: skill
category: content-creation
tags:
  - illustrations
  - domaine-public
  - pptx
  - blog
  - docx
created: '2026-02-16'
status: active
---
# Skill : trouver et intégrer des illustrations libres de droit

## Objectif
Trouver des illustrations de qualité (abstraites, ironiques, historiques, artistiques) provenant de sources fiables et libres de droit, puis les intégrer dans présentations, documents ou billets de blog.

## Déclencheurs d'utilisation
- Création de présentations (PPTX) nécessitant des visuels
- Rédaction de billets de blog ou articles  
- Création de documents Word enrichis
- Besoin d'illustrations historiques, artistiques ou conceptuelles
- Recherche d'images abstraites ou ironiques

---

## Sources prioritaires : domaine public et bibliothèques

### 1. Gallica (BnF - Bibliothèque nationale de France)
- **URL** : https://gallica.bnf.fr
- **Points forts** : 
  - Millions de documents français (gravures, estampes, photographies historiques, cartes anciennes)
  - Domaine public confirmé
  - Qualité exceptionnelle pour patrimoine français
- **Téléchargement HD** : Format IIIF `https://gallica.bnf.fr/iiif/ark:/12148/[ARK]/f[PAGE]/full/full/0/native`
- **Licence** : Domaine public (mention "Source gallica.bnf.fr / BnF" recommandée)
- **Idéal pour** : Histoire, littérature française, sciences anciennes, cartes, estampes

### 2. Metropolitan Museum (The Met)
- **URL** : https://www.metmuseum.org/art/collection
- **API** : https://metmuseum.github.io/
- **Points forts** :
  - 492 000+ œuvres en haute résolution
  - Collection encyclopédique (Égypte, Europe, Asie, Amériques)
  - API REST pour recherche automatisée
- **Recherche** : Filtrer par "Public Domain" 
- **Licence** : Creative Commons Zero (CC0) - aucune restriction
- **Idéal pour** : Art classique, antiquités, peintures de maîtres

### 3. Rijksmuseum
- **URL** : https://www.rijksmuseum.nl/en/rijksstudio
- **Points forts** :
  - Collections néerlandaises (Rembrandt, Vermeer...)
  - Ultra haute résolution
  - Interface Rijksstudio excellente
- **Licence** : Domaine public, usage commercial autorisé
- **Idéal pour** : Peinture flamande et hollandaise, art nordique

### 4. Smithsonian Open Access
- **URL** : https://www.si.edu/openaccess
- **Points forts** :
  - 5,1 millions d'items (2D et 3D)
  - 21 musées (sciences naturelles, histoire, aéronautique, art)
  - Modèles 3D disponibles
- **Licence** : CC0 pour open access
- **Idéal pour** : Sciences, histoire naturelle, innovations technologiques

### 5. Wikimedia Commons
- **URL** : https://commons.wikimedia.org
- **Points forts** :
  - 100+ millions de fichiers
  - Multilingue, très varié
  - Bien documenté
- **Important** : Vérifier licence de chaque image individuellement
- **Licence** : Variable (CC0, CC-BY, CC-BY-SA, domaine public)
- **Idéal pour** : Polyvalent, tous sujets

### 6. ArtVee
- **URL** : https://artvee.com
- **Points forts** :
  - Agrégateur de 45+ musées et bibliothèques
  - Interface épurée
  - Recherche par artiste, période, mouvement
- **Licence** : Domaine public
- **Idéal pour** : Peintures et dessins classiques

### 7. Public Domain Review
- **URL** : https://publicdomainreview.org
- **Points forts** :
  - Collection curée et contextualisée
  - Articles enrichis
  - Choix éditorial de qualité
- **Licence** : Domaine public vérifié
- **Idéal pour** : Images insolites, contexte culturel, découverte

---

## Sources modernes complémentaires

### Unsplash
- **URL** : https://unsplash.com
- Photos contemporaines haute qualité, esthétique moderne
- Licence Unsplash (usage libre y compris commercial)
- Pour : Photos modernes, lifestyle, business, tech

### Pexels
- **URL** : https://www.pexels.com
- Grande variété, vidéos disponibles
- Licence Pexels (similaire à CC0)
- Pour : Photos stock modernes polyvalentes

### Pixabay
- **URL** : https://pixabay.com
- 1+ million d'images, illustrations, vecteurs
- Licence Pixabay (libre de droits)
- Pour : Mix photos et illustrations contemporaines

### Rawpixel
- **URL** : https://www.rawpixel.com
- Section gratuite créative, mockups, PSD
- Pour : Webdesign, mockups, éléments graphiques

---

## Workflow d'intégration

### Pour PPTX (avec python-pptx)

```python
from pptx import Presentation
from pptx.util import Inches
from PIL import Image

# 1. Redimensionner l'image
img = Image.open('source.jpg')
img_resized = img.resize((1920, 1080), Image.Resampling.LANCZOS)
img_resized.save('slide_image.jpg', quality=95)

# 2. Intégrer dans présentation
prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout

left = Inches(0)
top = Inches(0)
pic = slide.shapes.add_picture('slide_image.jpg', left, top, 
                               width=prs.slide_width)

# 3. Attribution (si requise)
textbox = slide.shapes.add_textbox(
    Inches(0.5), Inches(7), Inches(3), Inches(0.3)
)
textbox.text_frame.text = "Image: Metropolitan Museum (CC0)"
```

### Pour blog (HTML avec attribution)

```html
<figure>
  <img src="blog_large.jpg" 
       srcset="blog_small.jpg 600w, blog_large.jpg 1200w"
       sizes="(max-width: 600px) 600px, 1200px"
       alt="Description détaillée">
  <figcaption>
    Image : <a href="URL_SOURCE">Titre</a>, 
    Artiste/Source, Domaine public via 
    <a href="https://gallica.bnf.fr">Gallica</a>
  </figcaption>
</figure>
```

### Pour DOCX (avec python-docx)

```python
from docx import Document
from docx.shared import Inches

doc = Document()
doc.add_picture('illustration.jpg', width=Inches(5))
doc.add_paragraph('Figure 1: Description')

caption = doc.add_paragraph()
caption.add_run('Source: ').italic = True
caption.add_run('Metropolitan Museum (CC0)')
```

---

## Recherche automatisée via Met API

```python
import requests

def search_met_collection(query, limit=10):
    """Recherche dans la collection du Met"""
    # Recherche
    search_url = "https://collectionapi.metmuseum.org/public/collection/v1/search"
    params = {
        'q': query,
        'hasImages': 'true',
        'isPublicDomain': 'true'
    }
    
    response = requests.get(search_url, params=params)
    results = response.json()
    
    if not results.get('objectIDs'):
        return []
    
    # Récupérer détails
    objects = []
    for obj_id in results['objectIDs'][:limit]:
        obj_url = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{obj_id}"
        obj_data = requests.get(obj_url).json()
        
        if obj_data.get('primaryImage'):
            objects.append({
                'title': obj_data.get('title'),
                'artist': obj_data.get('artistDisplayName'),
                'date': obj_data.get('objectDate'),
                'image_url': obj_data.get('primaryImage'),
                'object_url': obj_data.get('objectURL')
            })
    
    return objects

# Exemple
results = search_met_collection('landscape painting', limit=5)
for r in results:
    print(f"{r['title']} - {r['artist']} ({r['date']})")
```

---

## Bonnes pratiques d'attribution

**Domaine public strict (Gallica, Met CC0)** :
- Attribution recommandée mais pas obligatoire
- Format : `"Source: [Institution] / [Titre] / Domaine public"`

**Creative Commons** :
- Respecter exigences de la licence (BY, BY-SA, etc.)
- Format : `"[Titre] par [Auteur], licence [Type CC], via [Source]"`

**Vérification systématique** :
- Ne jamais se fier uniquement au nom de la source
- Vérifier la licence de chaque image individuellement
- Documenter la source dans métadonnées du fichier

---

## Choix selon contexte

**Abstraite / Conceptuelle** :
→ Gallica (estampes abstraites), art moderne du Met

**Ironique / Humoristique** :
→ Gravures anciennes (Gallica), Public Domain Review

**Académique / Sérieuse** :
→ Collections muséales (Met, Rijksmuseum)

**Moderne / Business** :
→ Unsplash, Pexels

---

## Cas d'usage spécifiques

### Présentation IA
- Smithsonian (innovations historiques pour contraste)
- Unsplash (tech moderne)
- Gallica (gravures scientifiques anciennes)

### Billet littéraire
- Gallica (éditions originales, portraits, gravures)
- Wikimedia Commons (portraits domaine public)

### Document académique
- Gallica (cartes anciennes, schémas scientifiques)
- Smithsonian (collections scientifiques)

### Formation entreprise
- Unsplash (photos business)
- Pexels (scènes de travail)
- Rawpixel (mockups)

---

## Checklist avant utilisation

- [ ] Vérifier licence de l'image spécifique
- [ ] Confirmer usage autorisé (commercial/non-commercial)
- [ ] Préparer attribution si nécessaire
- [ ] Télécharger en résolution appropriée (min 1920px pour slides)
- [ ] Optimiser pour support final (web, print, présentation)
- [ ] Tester lisibilité sur différents supports
- [ ] Documenter source dans métadonnées

---

## Outils complémentaires

**Recherche multi-sources** :
- AllTheFreeStock : https://allthefreestock.com
- Creative Commons Search : https://search.creativecommons.org

**Optimisation** :
- TinyPNG : compression sans perte visible
- Squoosh : outil Google
- ImageOptim : optimisation locale

---

## Notes importantes

1. **Toujours vérifier** : Même sur sources réputées, vérifier licence individuellement
2. **Préférer domaine public** : Pour usage commercial/sensible
3. **Attribution = bonne pratique** : Même quand non obligatoire
4. **Qualité > Quantité** : Une illustration pertinente vaut mieux que 10 génériques
5. **Contexte culturel** : Certaines œuvres nécessitent contextualisation

---

#skill #illustrations #domaine-public #presentations #blog
