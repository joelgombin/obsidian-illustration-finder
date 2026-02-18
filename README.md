# Illustration Finder for Obsidian

> Search and insert royalty-free illustrations directly into your Obsidian notes, powered by Claude AI.

![Version](https://img.shields.io/github/manifest-json/v/joelgombin/obsidian-illustration-finder)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Smart search**: Describe what you want — Claude analyzes your intent and builds optimized queries for each source
- **AI auto-fill**: Click the sparkle button to let Claude suggest an illustration based on your current note content
- **Multiple sources**: Metropolitan Museum (492K+ artworks), Unsplash (modern photos)
- **Auto-insert**: The selected image is downloaded to your vault and inserted at cursor position with attribution

## Installation

### Via Community Plugins (recommended)

1. Open Obsidian
2. Go to **Settings** → **Community plugins** → **Browse**
3. Search for "**Illustration Finder**"
4. Click **Install**, then **Enable**

### Manual installation

1. Download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/joelgombin/obsidian-illustration-finder/releases)
2. Create a folder `illustration-finder` in your `.obsidian/plugins/` directory
3. Copy the three files into it
4. Restart Obsidian and enable the plugin in **Settings** → **Community plugins**

## Configuration

### Anthropic API key (required)

Used by Claude to analyze your search intent and auto-fill from note content.

1. Create an account on [console.anthropic.com](https://console.anthropic.com)
2. Generate an API key
3. In Obsidian: **Settings** → **Illustration Finder** → paste your key

Without this key, the plugin still works but searches use your raw text as-is (no intent analysis).

### Unsplash API key (optional)

Required only if you want to search Unsplash photos.

1. Create an account on [unsplash.com/developers](https://unsplash.com/developers)
2. Create an application
3. Copy your Access Key
4. In Obsidian: **Settings** → **Illustration Finder** → paste the key

**Note**: 50 requests/hour on the demo mode.

### Other settings

- **Illustrations folder**: Where downloaded images are saved (default: `Assets/Illustrations`)
- **Default result count**: Number of results per source (1–20, default: 5)
- **Auto resize / Max width**: Resize images on download (default: 1920px)
- **Include attribution**: Add source/license text below inserted images
- **Cache results**: Cache search results for faster repeat searches

## Usage

1. Place your cursor where you want the image
2. Open the command palette (`Ctrl/Cmd + P`)
3. Run **"Illustration Finder: Search for an illustration"**
4. Describe what you're looking for — or click the sparkle button to auto-fill from your note
5. Optionally add context (e.g. "blog post about neuroscience")
6. Select which sources to search (Met Museum, Unsplash)
7. Pick an image from the results — it gets downloaded and inserted automatically

You can assign a custom hotkey in **Settings** → **Hotkeys** → search for "Illustration Finder".

### How Claude helps

When an Anthropic API key is configured, Claude:
- Analyzes your intent to determine the type of illustration (historical, modern, scientific, etc.)
- Picks the best sources based on context
- Formulates optimized search queries per source in English
- Suggests Met Museum department filters and date ranges for more relevant results

## Available sources

| Source | Type | License |
|--------|------|---------|
| **Metropolitan Museum** | Classical art, antiquities, 492K+ works | CC0 (public domain) |
| **Unsplash** | Modern photos | [Unsplash License](https://unsplash.com/license) |

## Network usage

This plugin makes network requests to the following external services:

- **Anthropic API** (`api.anthropic.com`) — AI intent analysis and note-based suggestions. Requires a user-provided API key. Your search query and (optionally) note content are sent to generate optimized search terms. No data is stored by the plugin beyond the current session.
- **Metropolitan Museum API** (`collectionapi.metmuseum.org`) — Public API, no authentication required. Search queries and image downloads.
- **Unsplash API** (`api.unsplash.com`) — Photo search. Requires a user-provided API key. Unsplash images are hotlinked (not downloaded) per [Unsplash guidelines](https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images).

This plugin does not collect telemetry or send any data to the plugin author.

## Contributing

Contributions are welcome!

1. Fork the project
2. Create a branch (`git checkout -b feature/improvement`)
3. `npm install && npm test && npm run build`
4. Commit and open a Pull Request

## License

MIT — see [LICENSE](LICENSE)

## Acknowledgements

- [Metropolitan Museum](https://www.metmuseum.org/) for their open access collection
- [Unsplash](https://unsplash.com/) for their photo library
- [Anthropic](https://www.anthropic.com/) for the Claude API

## Support

- **Bugs**: [GitHub Issues](https://github.com/joelgombin/obsidian-illustration-finder/issues)
- **Questions**: [Discussions](https://github.com/joelgombin/obsidian-illustration-finder/discussions)
