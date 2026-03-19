export type ParsedWikiLink = {
  raw: string;
  targetTitle: string;
};

const WIKI_LINK_REGEX = /\[\[([^[\]|]+?)(?:\|([^[\]]+))?\]\]/g;

export function parseWikiLinks(markdown: string): ParsedWikiLink[] {
  const matches = markdown.matchAll(WIKI_LINK_REGEX);

  return Array.from(matches, (match) => ({
    raw: match[0],
    targetTitle: (match[2] || match[1]).trim(),
  }));
}
