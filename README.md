# Illustration Finder for Obsidian

> Search and insert royalty-free illustrations directly into your Obsidian notes, powered by Claude AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Smart search**: Simply describe what you want — Claude understands your intent
- **Multiple sources**: Metropolitan Museum (492K+ artworks), Unsplash (modern photos), Gallica (French heritage)
- **Auto-insert**: Images are downloaded and inserted with proper attribution
- **Fast**: Results in seconds
- **100% free**: All images are royalty-free (CC0, public domain)

## Installation

### Via Community Plugins (recommended)

1. Open Obsidian
2. Go to **Settings** → **Community plugins** → **Browse**
3. Search for "**Illustration Finder**"
4. Click **Install**, then **Enable**

### Manual installation

1. Download the latest release from [GitHub](https://github.com/joelgombin/obsidian-illustration-finder/releases)
2. Extract the ZIP file into your `.obsidian/plugins/` folder
3. Restart Obsidian
4. Enable the plugin in **Settings** → **Community plugins**

## Configuration

### 1. Anthropic API key (required)

To use the smart intent analysis, you need to configure an Anthropic API key:

1. Create an account on [console.anthropic.com](https://console.anthropic.com)
2. Generate an API key
3. In Obsidian: **Settings** → **Illustration Finder** → paste your key

**Note**: The first 5 credits are free, then ~$0.003 per search.

### 2. Unsplash API key (optional)

To search for modern photos:

1. Create an account on [unsplash.com/developers](https://unsplash.com/developers)
2. Create an application
3. Copy your Access Key
4. In Obsidian: **Settings** → **Illustration Finder** → paste the key

**Note**: 50 requests/hour on the free tier.

### 3. Settings

- **Illustrations folder**: Where to save images (default: `Assets/Illustrations`)
- **Resize**: Automatically resize images (recommended)
- **Attribution**: Include attribution in the note (recommended for license compliance)

## Usage

### Basic search

1. Place your cursor where you want the image
2. Open the command palette (`Ctrl/Cmd + P`)
3. Type "**Illustration Finder**" and select the command
4. Describe what you're looking for:
   ```
   A 19th century scientific engraving about electricity
   ```
5. Choose an image from the results
6. The image is automatically inserted!

### Keyboard shortcut

Default: `Ctrl/Cmd + Shift + I`

Customizable in **Settings** → **Hotkeys** → **Illustration Finder**

### Search examples

**Historical art**:
```
Italian Renaissance portrait
```
→ Searches the Metropolitan Museum

**Ancient science**:
```
Anatomical engraving botanical plate
```
→ Searches Gallica and Met Museum

**Modern photo**:
```
Modern office with plants
```
→ Searches Unsplash

**Abstract/Conceptual**:
```
Ironic illustration about the passage of time
```
→ Claude picks the best sources based on context

## Available sources

| Source | Type | Number of works | License |
|--------|------|-----------------|---------|
| **Metropolitan Museum** | Classical art, antiquities | 492,000+ | CC0 (public domain) |
| **Unsplash** | Modern photos | Millions | Unsplash License |
| **Gallica (BnF)** | French heritage | Millions | Public domain |

### Which source to use?

- **Classical art, paintings, sculptures** → Met Museum
- **Modern photos, lifestyle, tech** → Unsplash
- **French heritage, old engravings, maps** → Gallica
- **Not sure?** → Let Claude choose!

## Tips

### Be specific

Bad: "A nature image"
Good: "Snowy mountain landscape at sunrise"

### Provide context

Use the "Context" field to refine results:
```
Intent: Scientific brain illustration
Context: Neuroscience article for students
```

### Check attribution

Even though images are royalty-free, it's good practice to keep attribution to:
- Respect the work of artists/photographers
- Track the source of your images
- Follow academic best practices

## Troubleshooting

### "Error: Invalid API key"

- Check that your Anthropic key is correct
- Verify you still have credits
- Try regenerating a new key

### "No results found"

- Try a broader search
- Check your internet connection
- Try a different source
- Rephrase your intent

### "Images won't download"

- Check permissions on the destination folder
- Check available disk space
- Try changing the folder in settings

### Slow performance

- Reduce the number of requested results
- Disable cache if experiencing memory issues
- Check your internet connection

## Contributing

Contributions are welcome!

1. Fork the project
2. Create a branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push (`git push origin feature/improvement`)
5. Open a Pull Request

## Changelog

### v1.0.0 (2026-02-16)

- Initial release
- Met Museum search
- Unsplash search
- Intent analysis powered by Claude
- Auto-insert with attribution
- Settings configuration

## License

MIT License - see [LICENSE](LICENSE)

## Acknowledgements

- [Metropolitan Museum](https://www.metmuseum.org/) for their incredible open access collection
- [Unsplash](https://unsplash.com/) for their beautiful photos
- [Gallica (BnF)](https://gallica.bnf.fr/) for digitizing French heritage
- [Anthropic](https://www.anthropic.com/) for the Claude API

## Support

- **Bugs**: [GitHub Issues](https://github.com/joelgombin/obsidian-illustration-finder/issues)
- **Questions**: [Discussions](https://github.com/joelgombin/obsidian-illustration-finder/discussions)
