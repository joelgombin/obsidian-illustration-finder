export class MockApp {
  vault = new MockVault();
  workspace = new MockWorkspace();
}

export class MockVault {
  files: Map<string, any> = new Map();

  async read(path: string): Promise<string> {
    const file = this.files.get(path);
    if (!file) throw new Error(`File not found: ${path}`);
    return file.content;
  }

  async createBinary(path: string, data: ArrayBuffer): Promise<void> {
    this.files.set(path, { content: data, type: 'binary' });
  }

  async createFolder(path: string): Promise<void> {
    this.files.set(path, { type: 'folder' });
  }

  getAbstractFileByPath(path: string) {
    return this.files.get(path) || null;
  }
}

export class MockWorkspace {
  activeEditor: any = {
    editor: new MockEditor(),
  };

  getActiveViewOfType(_type: any) {
    return {
      editor: new MockEditor(),
    };
  }
}

export class MockEditor {
  content: string = '';

  getValue(): string {
    return this.content;
  }

  replaceSelection(text: string) {
    this.content += text;
  }

  getCursor() {
    return { line: 0, ch: 0 };
  }
}

// Obsidian API stubs
export class App extends MockApp {}

export class Notice {
  constructor(public message: string, public duration?: number) {}
  hide() {}
}

export class Modal {
  app: any;
  contentEl: any;
  titleEl: any;

  constructor(app: any) {
    this.app = app;
    this.contentEl = createMockElement();
    this.titleEl = createMockElement();
  }

  open() {}
  close() {}
}

export class Plugin {
  app: any;
  manifest: any;

  constructor(app: any, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }

  loadData(): Promise<any> {
    return Promise.resolve({});
  }
  saveData(_data: any): Promise<void> {
    return Promise.resolve();
  }
  addCommand(_command: any) {}
  addSettingTab(_tab: any) {}
}

export class PluginSettingTab {
  app: any;
  plugin: any;
  containerEl: any;

  constructor(app: any, plugin: any) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = createMockElement();
  }

  display() {}
}

export class Setting {
  constructor(_containerEl: any) {}
  setName(_name: string) {
    return this;
  }
  setDesc(_desc: string) {
    return this;
  }
  addText(_cb: any) {
    return this;
  }
  addToggle(_cb: any) {
    return this;
  }
  addDropdown(_cb: any) {
    return this;
  }
}

export const MarkdownView = class {
  editor = new MockEditor();
};

function createMockElement(): any {
  return {
    empty() {},
    createEl(_tag: string, _opts?: any) {
      return createMockElement();
    },
    createDiv(_opts?: any) {
      return createMockElement();
    },
    setText(_text: string) {},
    addClass(_cls: string) {},
    addEventListener(_event: string, _cb: any) {},
    appendChild(_child: any) {},
    querySelectorAll(_selector: string) {
      return [];
    },
    innerHTML: '',
    textContent: '',
    style: {},
    type: '',
    value: '',
    checked: false,
    src: '',
    dataset: {},
    parentElement: null,
  };
}
