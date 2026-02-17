import { App, Modal } from 'obsidian';
import { IllustrationResult } from '../types/types';

export class PreviewModal extends Modal {
  private result: IllustrationResult;
  private onInsert: (result: IllustrationResult) => void;

  constructor(
    app: App,
    result: IllustrationResult,
    onInsert: (result: IllustrationResult) => void
  ) {
    super(app);
    this.result = result;
    this.onInsert = onInsert;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('illustration-finder-preview-modal');

    this.titleEl.setText(this.result.title);

    // Full-size image
    contentEl.createEl('img', {
      cls: 'illustration-finder-preview-image',
      attr: {
        src: this.result.imageUrl,
        alt: this.result.title,
        loading: 'lazy',
      },
    });

    // Metadata
    const meta = contentEl.createDiv({
      cls: 'illustration-finder-preview-meta',
    });

    if (this.result.artist) {
      meta.createEl('p', { text: `Artist: ${this.result.artist}` });
    }
    if (this.result.date) {
      meta.createEl('p', { text: `Date: ${this.result.date}` });
    }
    meta.createEl('p', { text: `Source: ${this.result.source}` });
    meta.createEl('p', { text: `License: ${this.result.license}` });
    if (this.result.description) {
      meta.createEl('p', { text: `Description: ${this.result.description}` });
    }
    meta.createEl('p', {
      text: `Attribution: ${this.result.attribution}`,
      cls: 'illustration-finder-attribution',
    });

    // Buttons
    const buttonRow = contentEl.createDiv({
      cls: 'illustration-finder-button-row',
    });

    const closeBtn = buttonRow.createEl('button', { text: 'Close' });
    closeBtn.addEventListener('click', () => this.close());

    const insertBtn = buttonRow.createEl('button', {
      text: 'Insert',
      cls: 'mod-cta',
    });
    insertBtn.addEventListener('click', () => {
      this.onInsert(this.result);
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
