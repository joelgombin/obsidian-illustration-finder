import { App, Modal } from 'obsidian';
import { IllustrationResult, SearchError } from '../types/types';
import { PreviewModal } from './PreviewModal';

export class ResultsModal extends Modal {
  private results: IllustrationResult[];
  private errors: SearchError[];
  private onInsert: (result: IllustrationResult) => void;

  constructor(
    app: App,
    results: IllustrationResult[],
    errors: SearchError[],
    onInsert: (result: IllustrationResult) => void
  ) {
    super(app);
    this.results = results;
    this.errors = errors;
    this.onInsert = onInsert;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('illustration-finder-results-modal');

    this.titleEl.setText(
      `Search results - ${this.results.length} illustration${this.results.length !== 1 ? 's' : ''} found`
    );

    // Show errors if any
    if (this.errors.length > 0) {
      const errorDiv = contentEl.createDiv({
        cls: 'illustration-finder-error-notice',
      });
      errorDiv.createEl('strong', { text: 'Some sources encountered errors:' });
      const errorList = errorDiv.createEl('ul');
      for (const error of this.errors) {
        errorList.createEl('li', {
          text: `${error.source}: ${error.error}`,
        });
      }
    }

    // Empty state
    if (this.results.length === 0) {
      const emptyDiv = contentEl.createDiv({
        cls: 'illustration-finder-empty-state',
      });
      emptyDiv.createEl('p', {
        text: 'No results found. Try refining your search or selecting different sources.',
      });
      return;
    }

    // Results grid
    const grid = contentEl.createDiv({
      cls: 'illustration-finder-results-grid',
    });

    for (const result of this.results) {
      this.renderResultCard(grid, result);
    }

    // Close button
    const buttonRow = contentEl.createDiv({
      cls: 'illustration-finder-button-row',
    });
    const closeBtn = buttonRow.createEl('button', { text: 'Close' });
    closeBtn.addEventListener('click', () => this.close());
  }

  private renderResultCard(container: HTMLElement, result: IllustrationResult) {
    const card = container.createDiv({
      cls: 'illustration-finder-result-card',
    });

    // Thumbnail
    const img = card.createEl('img', {
      attr: {
        src: result.thumbnailUrl,
        alt: result.title,
        loading: 'lazy',
      },
    });
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const placeholder = card.createDiv({
        cls: 'illustration-finder-img-placeholder',
      });
      placeholder.setText('Image unavailable');
    });

    // Info
    const info = card.createDiv({ cls: 'illustration-finder-result-info' });
    info.createEl('h4', {
      text: result.title.length > 60
        ? result.title.substring(0, 57) + '...'
        : result.title,
    });

    if (result.artist || result.date) {
      const meta = [result.artist, result.date].filter(Boolean).join(', ');
      info.createEl('p', { text: meta });
    }

    info.createEl('p', { text: `Source: ${result.source}` });
    info.createEl('p', { text: `License: ${result.license}` });

    // Actions
    const actions = card.createDiv({
      cls: 'illustration-finder-result-actions',
    });

    const previewBtn = actions.createEl('button', { text: 'Preview' });
    previewBtn.addEventListener('click', () => {
      new PreviewModal(this.app, result, (r) => {
        this.onInsert(r);
        this.close();
      }).open();
    });

    const insertBtn = actions.createEl('button', {
      text: 'Insert',
      cls: 'mod-cta',
    });
    insertBtn.addEventListener('click', () => {
      this.onInsert(result);
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
