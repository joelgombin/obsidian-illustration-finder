import { IllustrationResult } from '../types/types';

export function generateImageMarkdown(
  title: string,
  filepath: string,
  attribution: string,
  includeAttribution: boolean
): string {
  let md = `![${title}](${filepath})`;
  if (includeAttribution && attribution) {
    md += `\n*${attribution}*`;
  }
  return md;
}

export function formatAttribution(
  result: IllustrationResult,
  format: string
): string {
  return format
    .replace('{source}', result.source)
    .replace('{license}', result.license)
    .replace('{artist}', result.artist || 'Unknown')
    .replace('{title}', result.title);
}
