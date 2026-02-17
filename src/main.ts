import { Notice, Plugin } from 'obsidian';
import {
  IllustrationFinderSettings,
  DEFAULT_SETTINGS,
  IllustrationFinderSettingsTab,
} from './settings';
import {
  IllustrationResult,
  IntentionAnalysis,
  SearchParams,
  SearchResults,
  SearchError,
} from './types/types';
import { ClaudeService } from './services/ClaudeService';
import { MetMuseumService } from './services/MetMuseumService';
import { UnsplashService } from './services/UnsplashService';

import { ImageDownloader } from './services/ImageDownloader';
import { SearchModal } from './modals/SearchModal';
import { ResultsModal } from './modals/ResultsModal';

export default class IllustrationFinderPlugin extends Plugin {
  settings: IllustrationFinderSettings = DEFAULT_SETTINGS;
  private claudeService: ClaudeService | null = null;
  private metService: MetMuseumService = new MetMuseumService();
  private unsplashService: UnsplashService | null = null;


  async onload() {
    await this.loadSettings();
    this.initServices();

    this.addCommand({
      id: 'search-illustration',
      name: 'Search for an illustration',
      editorCallback: () => {
        this.openSearchModal();
      },
    });

    this.addSettingTab(new IllustrationFinderSettingsTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.initServices();
  }

  private initServices() {
    if (this.settings.anthropicApiKey) {
      this.claudeService = new ClaudeService(this.settings.anthropicApiKey);
    } else {
      this.claudeService = null;
    }

    if (this.settings.unsplashApiKey) {
      this.unsplashService = new UnsplashService(this.settings.unsplashApiKey);
    } else {
      this.unsplashService = null;
    }
  }

  private openSearchModal() {
    let noteContent = '';
    const editor = this.app.workspace.activeEditor?.editor;
    if (editor) {
      noteContent = editor.getValue();
    }

    const modal = new SearchModal(
      this.app,
      this.settings.defaultSources,
      this.settings.defaultResultCount,
      this.claudeService,
      noteContent,
      async (params: SearchParams) => {
        await this.handleSearch(params);
      }
    );
    modal.open();
  }

  private async handleSearch(params: SearchParams) {
    const loadingNotice = new Notice('Searching for illustrations...', 0);

    try {
      const results = await this.executeSearch(params);
      loadingNotice.hide();

      new ResultsModal(
        this.app,
        results.results,
        results.errors,
        (result: IllustrationResult) => {
          this.handleInsert(result);
        }
      ).open();
    } catch (error: any) {
      loadingNotice.hide();
      new Notice(`Search error: ${error.message}`);
    }
  }

  async executeSearch(params: SearchParams): Promise<SearchResults> {
    // Step 1: Claude analysis (or fallback)
    let analysis: IntentionAnalysis;

    if (this.claudeService) {
      try {
        analysis = await this.claudeService.analyzeIntention(
          params.intention,
          params.context || '',
          params.sources
        );
      } catch (error: any) {
        console.warn('Claude analysis failed, using fallback:', error.message);
        analysis = this.createFallbackAnalysis(params);
      }
    } else {
      analysis = this.createFallbackAnalysis(params);
    }

    // Step 2: Parallel API searches
    const searchPromises: Promise<{
      source: string;
      results: IllustrationResult[];
    }>[] = [];

    for (const source of analysis.sources) {
      if (!params.sources.includes(source)) continue;

      const query = analysis.queries[source] || params.intention;

      if (source === 'met') {
        searchPromises.push(
          this.metService
            .search(query, params.limit, analysis.metFilters)
            .then((results) => ({ source: 'met', results }))
        );
      } else if (source === 'unsplash' && this.unsplashService) {
        searchPromises.push(
          this.unsplashService
            .search(query, params.limit)
            .then((results) => ({ source: 'unsplash', results }))
        );
      }
    }

    // Step 3: Aggregate results
    const settled = await Promise.allSettled(searchPromises);
    const allResults: IllustrationResult[] = [];
    const errors: SearchError[] = [];

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value.results);
      } else {
        const reason = result.reason;
        errors.push({
          source: reason?.source || 'unknown',
          error: reason?.message || 'Unknown error',
          query: params.intention,
        });
      }
    }

    return {
      query: params,
      analysis,
      results: allResults,
      errors,
      timestamp: Date.now(),
    };
  }

  private createFallbackAnalysis(params: SearchParams): IntentionAnalysis {
    return {
      analysis: {
        type: 'unknown',
        period: null,
        style: null,
        keywords: params.intention.split(/\s+/).filter(Boolean),
      },
      sources: params.sources,
      queries: Object.fromEntries(
        params.sources.map((s) => [s, params.intention])
      ),
      reasoning: 'No Anthropic API key configured, using raw intention',
    };
  }

  private async handleInsert(result: IllustrationResult) {
    const downloader = new ImageDownloader(this.app);
    try {
      await downloader.downloadAndInsert({
        result,
        targetFolder: this.settings.illustrationFolder,
        maxWidth: this.settings.autoResize
          ? this.settings.maxImageWidth
          : undefined,
      });
    } catch (error: any) {
      new Notice(`Error inserting image: ${error.message}`);
    }
  }
}
