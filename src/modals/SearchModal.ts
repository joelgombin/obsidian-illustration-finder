import { App, Modal } from 'obsidian';
import { SearchParams } from '../types/types';

const SOURCE_OPTIONS = [
  { id: 'met', label: 'Metropolitan Museum' },
  { id: 'unsplash', label: 'Unsplash' },
  { id: 'gallica', label: 'Gallica (BnF)' },
];

export class SearchModal extends Modal {
  private defaultSources: string[];
  private defaultResultCount: number;
  private onSubmit: (params: SearchParams) => void;

  constructor(
    app: App,
    defaultSources: string[],
    defaultResultCount: number,
    onSubmit: (params: SearchParams) => void
  ) {
    super(app);
    this.defaultSources = defaultSources;
    this.defaultResultCount = defaultResultCount;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('illustration-finder-search-modal');

    this.titleEl.setText('Search for an illustration');

    // Intention field
    const intentionDiv = contentEl.createDiv({
      cls: 'illustration-finder-field',
    });
    intentionDiv.createEl('label', { text: 'Describe your intention:' });
    const intentionInput = intentionDiv.createEl('textarea', {
      cls: 'illustration-finder-textarea',
      attr: {
        placeholder:
          'e.g., A scientific engraving from the 19th century about electricity...',
        maxlength: '500',
        rows: '3',
      },
    });

    // Context field
    const contextDiv = contentEl.createDiv({
      cls: 'illustration-finder-field',
    });
    contextDiv.createEl('label', { text: 'Context (optional):' });
    const contextInput = contextDiv.createEl('textarea', {
      cls: 'illustration-finder-textarea',
      attr: {
        placeholder: 'e.g., Blog post about the history of AI',
        maxlength: '300',
        rows: '2',
      },
    });

    // Sources selection
    const sourcesDiv = contentEl.createDiv({
      cls: 'illustration-finder-sources',
    });
    sourcesDiv.createEl('label', { text: 'Priority sources:' });

    const sourceCheckboxes: Map<string, HTMLInputElement> = new Map();
    for (const source of SOURCE_OPTIONS) {
      const optionDiv = sourcesDiv.createDiv({
        cls: 'illustration-finder-source-option',
      });
      const checkbox = optionDiv.createEl('input', {
        attr: {
          type: 'checkbox',
          id: `source-${source.id}`,
        },
      });
      checkbox.checked = this.defaultSources.includes(source.id);
      sourceCheckboxes.set(source.id, checkbox);
      optionDiv.createEl('label', {
        text: source.label,
        attr: { for: `source-${source.id}` },
      });
    }

    // Result count
    const countDiv = contentEl.createDiv({
      cls: 'illustration-finder-field',
    });
    countDiv.createEl('label', { text: 'Number of results:' });
    const countInput = countDiv.createEl('input', {
      cls: 'illustration-finder-count-input',
      attr: {
        type: 'number',
        min: '1',
        max: '20',
        value: String(this.defaultResultCount),
      },
    });

    // Buttons
    const buttonRow = contentEl.createDiv({
      cls: 'illustration-finder-button-row',
    });

    const cancelBtn = buttonRow.createEl('button', { text: 'Cancel' });
    cancelBtn.addEventListener('click', () => this.close());

    const searchBtn = buttonRow.createEl('button', {
      text: 'Search',
      cls: 'mod-cta',
    });

    const doSearch = () => {
      const intention = intentionInput.value.trim();
      if (!intention) {
        intentionInput.addClass('illustration-finder-error');
        return;
      }

      const selectedSources: string[] = [];
      sourceCheckboxes.forEach((checkbox, id) => {
        if (checkbox.checked) {
          selectedSources.push(id);
        }
      });

      if (selectedSources.length === 0) {
        return;
      }

      const limit = Math.min(
        20,
        Math.max(1, parseInt(countInput.value, 10) || this.defaultResultCount)
      );

      this.onSubmit({
        intention,
        context: contextInput.value.trim() || undefined,
        sources: selectedSources,
        limit,
      });

      this.close();
    };

    searchBtn.addEventListener('click', doSearch);

    // Enter key in intention textarea triggers search (without Shift)
    intentionInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doSearch();
      }
    });

    // Auto-focus intention input
    setTimeout(() => intentionInput.focus(), 50);
  }

  onClose() {
    this.contentEl.empty();
  }
}
