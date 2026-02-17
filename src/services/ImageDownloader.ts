import { App, MarkdownView, Notice } from 'obsidian';
import { IllustrationResult, DownloadOptions } from '../types/types';
import { sanitizeFilename } from '../utils/image';
import { generateImageMarkdown } from '../utils/markdown';

export class ImageDownloader {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  async downloadAndInsert(options: DownloadOptions): Promise<void> {
    const { result, targetFolder } = options;

    let markdown: string;

    if (result.source === 'Unsplash') {
      // Hotlink Unsplash images per their guidelines:
      // https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images
      const link = `[${result.artist} on Unsplash](${result.sourceUrl})`;
      markdown = `![${result.title}](${result.imageUrl})\n*Photo by ${link}*`;
    } else {
      // Download and save locally for other sources
      const response = await fetch(result.imageUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to download image: ${response.status} ${response.statusText}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();

      if (!this.app.vault.getAbstractFileByPath(targetFolder)) {
        await this.app.vault.createFolder(targetFolder);
      }

      const filename = this.generateFilename(result);
      const filepath = `${targetFolder}/${filename}`;
      await this.app.vault.createBinary(filepath, arrayBuffer);

      markdown = this.generateMarkdown(result, filepath);
    }

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      view.editor.replaceSelection(markdown);
    }

    new Notice('Image inserted successfully');
  }

  generateFilename(result: IllustrationResult): string {
    const timestamp = Date.now();
    const source = result.source.toLowerCase().replace(/\s/g, '-');
    const title = sanitizeFilename(result.title);
    return `${timestamp}_${source}_${title}.jpg`;
  }

  generateMarkdown(result: IllustrationResult, filepath: string): string {
    return generateImageMarkdown(result.title, filepath, result.attribution, true);
  }
}
