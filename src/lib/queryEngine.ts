import { categories, engines, platformTemplates } from '../data/searchConfig';
export type AdvancedOptions = { exactPhrase: boolean; exclusions: string; requiredKeywords: string; sites: string; excludedSites: string; language: string; region: string; dateRange: string };
export type GeneratedQuery = { id: string; engineId: string; engineName: string; categoryId: string; categoryName: string; query: string; explanation: string; url: string };
const words = (value: string) => value.split(/[\s,]+/).map(v => v.trim()).filter(Boolean);
const adapt = (query: string, supports: string[]) => {
  let next = query;
  if (!supports.includes('filetype')) next = next.replace(/\(?filetype:\w+(\s+OR\s+filetype:\w+)*\)?/gi, 'documents');
  if (!supports.includes('intitle')) next = next.replace(/intitle:/gi, '');
  if (!supports.includes('inurl')) next = next.replace(/inurl:/gi, '');
  return next.replace(/\s+/g, ' ').trim();
};
export function generateQueries(input: { target: string; categoryIds: string[]; engineIds: string[]; platformIds: string[]; advanced: AdvancedOptions }): GeneratedQuery[] {
  const target = input.advanced.exactPhrase ? `"${input.target.trim()}"` : input.target.trim();
  if (!target) return [];
  const activeCategories = categories.filter(c => input.categoryIds.includes(c.id));
  const activeEngines = engines.filter(e => input.engineIds.includes(e.id));
  const platforms = platformTemplates.filter(p => input.platformIds.includes(p.id));
  const raw: GeneratedQuery[] = [];
  activeEngines.forEach(engine => activeCategories.forEach(category => {
    const platformTargets = category.id === 'social' && platforms.length ? platforms : [undefined];
    platformTargets.forEach(platform => {
      let query = category.template.replace('{target}', target);
      if (platform) query = `${target} site:${platform.domain} ${platform.terms}`;
      words(input.advanced.requiredKeywords).forEach(term => { query += ` ${term}`; });
      words(input.advanced.sites).forEach(site => { query += ` site:${site}`; });
      words(input.advanced.exclusions).forEach(term => { query += ` -${term}`; });
      words(input.advanced.excludedSites).forEach(site => { query += ` -site:${site}`; });
      if (input.advanced.language) query += ` ${input.advanced.language}`;
      if (input.advanced.region) query += ` ${input.advanced.region}`;
      if (input.advanced.dateRange) query += ` ${input.advanced.dateRange}`;
      query = adapt(query, engine.supports);
      const generated = { id: `${engine.id}-${category.id}-${platform?.id || 'base'}-${raw.length}`, engineId: engine.id, engineName: engine.name, categoryId: category.id, categoryName: platform ? `${category.name}: ${platform.name}` : category.name, query, explanation: `Optimized for ${engine.name}; unsupported operators are simplified while preserving the ${category.name.toLowerCase()} research intent.`, url: engine.url.replace('{query}', encodeURIComponent(query)) };
      raw.push(generated);
    });
  }));
  return raw;
}
export function buildSearchUrl(query: GeneratedQuery) { return query.url; }
