import obsidianmd from 'eslint-plugin-obsidianmd';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['main.js', 'coverage/**'],
  },
  {
    // `files` is required: without it flat config matches only .js, so none of
    // the plugin source gets linted.
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      // Several obsidianmd rules need type information.
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { obsidianmd },
    rules: obsidianmd.configs.recommended,
  },
];
