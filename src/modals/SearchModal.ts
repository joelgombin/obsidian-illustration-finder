import { App, Modal, Notice, setIcon } from 'obsidian';
import { SearchParams } from '../types/types';
import { ClaudeService } from '../services/ClaudeService';

const SOURCE_OPTIONS = [
  { id: 'met', label: 'Metropolitan Museum' },
  { id: 'unsplash', label: 'Unsplash' },
];

export class SearchModal extends Modal {
  private defaultSources: string[];
  private defaultResultCount: number;
  private onSubmit: (params: SearchParams) => void;
  private claudeService: ClaudeService | null;
  private noteContent: string;

  constructor(
    app: App,
    defaultSources: string[],
    defaultResultCount: number,
    claudeService: ClaudeService | null,
    noteContent: string,
    onSubmit: (params: SearchParams) => void
  ) {
    super(app);
    this.defaultSources = defaultSources;
    this.defaultResultCount = defaultResultCount;
    this.claudeService = claudeService;
    this.noteContent = noteContent;
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
    const intentionLabelRow = intentionDiv.createDiv({
      cls: 'illustration-finder-label-row',
    });
    intentionLabelRow.createEl('label', { text: 'Describe your intention:' });

    const intentionInput = intentionDiv.createEl('textarea', {
      cls: 'illustration-finder-textarea',
      attr: {
        placeholder:
          'e.g., a scientific engraving from the 19th century about electricity...',
        maxlength: '500',
        rows: '3',
      },
    });

    // Context field
    const contextDiv = contentEl.createDiv({
      cls: 'illustration-finder-field',
    });
    const contextLabelRow = contextDiv.createDiv({
      cls: 'illustration-finder-label-row',
    });
    contextLabelRow.createEl('label', { text: 'Context (optional):' });

    const contextInput = contextDiv.createEl('textarea', {
      cls: 'illustration-finder-textarea',
      attr: {
        placeholder: 'e.g., blog post about the history of AI',
        maxlength: '300',
        rows: '2',
      },
    });

    // Add sparkle buttons if Claude is available and there's note content
    if (this.claudeService && this.noteContent.trim()) {
      const sparkleBtn = intentionLabelRow.createEl('button', {
        cls: 'illustration-finder-sparkle-btn',
        attr: { 'aria-label': 'Auto-fill from note with AI' },
      });
      setIcon(sparkleBtn, 'sparkles');

      let isLoading = false;
      sparkleBtn.addEventListener('click', () => {
        if (isLoading || !this.claudeService) return;
        isLoading = true;
        sparkleBtn.addClass('is-loading');
        sparkleBtn.setAttribute('disabled', 'true');

        this.claudeService.suggestFromNote(this.noteContent)
          .then((suggestion) => {
            if (suggestion.intention) {
              intentionInput.value = suggestion.intention;
              intentionInput.removeClass('illustration-finder-error');
            }
            if (suggestion.context) {
              contextInput.value = suggestion.context;
            }
            if (!suggestion.intention && !suggestion.context) {
              new Notice('Could not generate suggestions from this note.');
            }
          })
          .catch(() => {
            new Notice('AI suggestion failed, check your Anthropic API key.');
          })
          .finally(() => {
            isLoading = false;
            sparkleBtn.removeClass('is-loading');
            sparkleBtn.removeAttribute('disabled');
          });
      });
    }

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
