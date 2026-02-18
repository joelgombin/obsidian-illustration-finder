import { App, PluginSettingTab, Setting } from 'obsidian';
import type IllustrationFinderPlugin from './main';

export interface IllustrationFinderSettings {
  anthropicApiKey: string;
  unsplashApiKey: string;
  illustrationFolder: string;
  defaultSources: string[];
  defaultResultCount: number;
  autoResize: boolean;
  maxImageWidth: number;
  includeAttribution: boolean;
  attributionFormat: string;
  cacheResults: boolean;
  cacheDuration: number;
}

export const DEFAULT_SETTINGS: IllustrationFinderSettings = {
  anthropicApiKey: '',
  unsplashApiKey: '',
  illustrationFolder: 'Assets/Illustrations',
  defaultSources: ['met', 'unsplash'],
  defaultResultCount: 5,
  autoResize: true,
  maxImageWidth: 1920,
  includeAttribution: true,
  attributionFormat: '*Source: {source} - {license}*',
  cacheResults: true,
  cacheDuration: 3600,
};

export class IllustrationFinderSettingsTab extends PluginSettingTab {
  plugin: IllustrationFinderPlugin;

  constructor(app: App, plugin: IllustrationFinderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName('API keys').setHeading();

    new Setting(containerEl)
      .setName('Anthropic API key')
      .setDesc('Required for Claude AI intent analysis')
      .addText((text) => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('sk-ant-...')
          .setValue(this.plugin.settings.anthropicApiKey)
          .onChange(async (value) => {
            this.plugin.settings.anthropicApiKey = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Unsplash API key')
      .setDesc('Optional - needed for Unsplash photo search')
      .addText((text) => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('Your Unsplash access key')
          .setValue(this.plugin.settings.unsplashApiKey)
          .onChange(async (value) => {
            this.plugin.settings.unsplashApiKey = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl).setName('Folders').setHeading();

    new Setting(containerEl)
      .setName('Illustration folder')
      .setDesc('Folder where downloaded illustrations are stored')
      .addText((text) =>
        text
          .setPlaceholder('Assets/Illustrations')
          .setValue(this.plugin.settings.illustrationFolder)
          .onChange(async (value) => {
            this.plugin.settings.illustrationFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setName('Behavior').setHeading();

    new Setting(containerEl)
      .setName('Default result count')
      .setDesc('Number of results to show per source (1-20)')
      .addText((text) =>
        text
          .setPlaceholder('5')
          .setValue(String(this.plugin.settings.defaultResultCount))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 1 && num <= 20) {
              this.plugin.settings.defaultResultCount = num;
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName('Auto resize images')
      .setDesc('Automatically resize images to max width')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoResize)
          .onChange(async (value) => {
            this.plugin.settings.autoResize = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Max image width')
      .setDesc('Maximum width in pixels for downloaded images')
      .addText((text) =>
        text
          .setPlaceholder('1920')
          .setValue(String(this.plugin.settings.maxImageWidth))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.maxImageWidth = num;
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName('Include attribution')
      .setDesc('Add attribution text below inserted images')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeAttribution)
          .onChange(async (value) => {
            this.plugin.settings.includeAttribution = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Cache results')
      .setDesc('Cache search results for faster repeat searches')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.cacheResults)
          .onChange(async (value) => {
            this.plugin.settings.cacheResults = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
