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

    // Download the image
    const response = await fetch(result.imageUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();

    // Ensure target folder exists
    if (!this.app.vault.getAbstractFileByPath(targetFolder)) {
      await this.app.vault.createFolder(targetFolder);
    }

    // Generate filename and save
    const filename = this.generateFilename(result);
    const filepath = `${targetFolder}/${filename}`;
    await this.app.vault.createBinary(filepath, arrayBuffer);

    // Generate markdown and insert at cursor
    const markdown = this.generateMarkdown(result, filepath);
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
