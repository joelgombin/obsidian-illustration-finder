import obsidianmd from 'eslint-plugin-obsidianmd';

export default [
  {
    plugins: { obsidianmd },
    rules: {
      'obsidianmd/ui/sentence-case': 'error',
    },
  },
];
