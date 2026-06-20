import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { engines, categories, presets, platformTemplates, operatorReference } from './data/searchConfig';
import { generateQueries, buildSearchUrl, type GeneratedQuery, type AdvancedOptions } from './lib/queryEngine';

const defaultEngines = ['google', 'bing', 'duckduckgo'];
const defaultCategories = ['general'];

function ToggleChip({ active, children, onClick, ariaLabel }: { active: boolean; children: React.ReactNode; onClick: () => void; ariaLabel?: string }) {
  return <button className={`chip ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active} aria-label={ariaLabel}>{children}</button>;
}

function App() {
  const [target, setTarget] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultCategories);
  const [selectedEngines, setSelectedEngines] = useState<string[]>(defaultEngines);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [openPanel, setOpenPanel] = useState<string>('query');
  const [options, setOptions] = useState<AdvancedOptions>({ exactPhrase: false, exclusions: '', requiredKeywords: '', sites: '', excludedSites: '', language: '', region: '', dateRange: '' });
  const [queries, setQueries] = useState<GeneratedQuery[]>([]);
  const [querySearch, setQuerySearch] = useState('');
  const [engineFilter, setEngineFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const filtered = useMemo(() => queries.filter(q =>
    (engineFilter === 'all' || q.engineId === engineFilter) &&
    (categoryFilter === 'all' || q.categoryId === categoryFilter) &&
    (!querySearch || `${q.query} ${q.explanation}`.toLowerCase().includes(querySearch.toLowerCase()))
  ), [queries, engineFilter, categoryFilter, querySearch]);

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) => setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  const applyPreset = (id: string) => {
    const preset = presets.find(p => p.id === id); if (!preset) return;
    setSelectedCategories(preset.categories); setSelectedPlatforms(preset.platforms); setSelectedEngines(preset.engines); setTarget(target || preset.exampleTarget);
  };
  const generate = () => {
    const next = generateQueries({ target, categoryIds: selectedCategories, engineIds: selectedEngines, platformIds: selectedPlatforms, advanced: options });
    setQueries(next); setSelected([]); setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const launch = (items: GeneratedQuery[]) => {
    if (items.length > 8 && !confirm(`Open ${items.length} tabs? Your browser may block some popups.`)) return;
    items.forEach(q => window.open(buildSearchUrl(q), '_blank', 'noopener,noreferrer'));
  };
  const exportQueries = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'osint-searches.json'; a.click(); URL.revokeObjectURL(url);
  };

  return <main>
    <nav className="topbar" aria-label="Primary"><div className="brand"><span>🛡️</span><span>Search Workspace</span></div><button className="ghost" onClick={() => setShowHelp(!showHelp)}><span>?</span> Help</button></nav>
    <section className="hero"><div><p className="eyebrow"><span>✨</span> Multi-engine OSINT query builder</p><h1>Launch smarter public-source searches in seconds.</h1><p className="subtext">Enter a target, pick a category and engines, then review optimized queries adapted to each platform.</p></div></section>
    <section className="workspace" aria-labelledby="builder-title"><div className="panel builder"><h2 id="builder-title">1. Enter target</h2><label className="field"><span>Target</span><input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Name, username, email, domain, company..." aria-label="Search target" autoFocus /></label>
      <div className="preset-row"><span>Quick presets</span>{presets.map(p => <button key={p.id} className="preset" onClick={() => applyPreset(p.id)}>{p.name}</button>)}</div>
      <h2>2. Choose search type</h2><div className="grid chips">{categories.map(c => <ToggleChip key={c.id} active={selectedCategories.includes(c.id)} onClick={() => toggle(c.id, selectedCategories, setSelectedCategories)}>{c.icon} {c.name}</ToggleChip>)}</div>
      <h2>3. Choose search engines</h2><div className="grid chips engines">{engines.map(e => <ToggleChip key={e.id} active={selectedEngines.includes(e.id)} onClick={() => toggle(e.id, selectedEngines, setSelectedEngines)}>{e.name}</ToggleChip>)}</div>
      {selectedCategories.includes('social') && <><h2>Social platforms</h2><div className="grid chips">{platformTemplates.map(p => <ToggleChip key={p.id} active={selectedPlatforms.includes(p.id)} onClick={() => toggle(p.id, selectedPlatforms, setSelectedPlatforms)}>{p.name}</ToggleChip>)}</div></>}
      <div className="mode"><div><strong>Advanced Mode</strong><p>Reveal operator, site, localization, time, engine, and preset controls only when needed.</p></div><button className="switch" aria-pressed={advanced} onClick={()=>setAdvanced(!advanced)}>{advanced ? 'On' : 'Off'}</button></div>
      {advanced && <section className="advanced" aria-label="Advanced search options">{['query','sites','localization','time','engine','presets'].map(id => <article className="accordion" key={id}><button onClick={()=>setOpenPanel(openPanel===id?'':id)}>{id[0].toUpperCase()+id.slice(1)} options <span>{openPanel===id?'−':'+'}</span></button>{openPanel===id && <AdvancedPanel id={id} options={options} setOptions={setOptions}/>}</article>)}</section>}
      <button className="primary sticky" disabled={!target || selectedEngines.length===0 || selectedCategories.length===0} onClick={generate}><span>🔎</span> Generate Searches</button>
    </div></section>
    {showHelp && <HelpCenter />}
    <section id="results" className="results"><div className="section-head"><div><p className="eyebrow"><span>▾</span> Generated Searches</p><h2>Review and launch</h2></div><div className="actions"><button onClick={()=>launch(filtered)}>Launch all</button><button onClick={()=>launch(filtered.filter(q=>selected.includes(q.id)))} disabled={!selected.length}>Launch selected</button><button onClick={exportQueries} disabled={!filtered.length}>Export</button></div></div>
      <div className="controls"><input placeholder="Search generated queries" value={querySearch} onChange={e=>setQuerySearch(e.target.value)} /><select value={engineFilter} onChange={e=>setEngineFilter(e.target.value)}><option value="all">All engines</option>{engines.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="all">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="cards">{filtered.map(q => <article className="card" key={q.id}><div className="card-top"><input type="checkbox" aria-label={`Select ${q.engineName} query`} checked={selected.includes(q.id)} onChange={()=>toggle(q.id, selected, setSelected)} /><span className="badge">{q.engineName}</span><span className="badge muted">{q.categoryName}</span><button className="icon"><span>☆</span></button></div><code>{q.query}</code><p>{q.explanation}</p><div className="card-actions"><button onClick={()=>navigator.clipboard.writeText(q.query)}><span>⧉</span> Copy</button><button className="launch" onClick={()=>launch([q])}><span>↗</span> Launch</button></div></article>)}</div>{!queries.length && <div className="empty">Generated searches will appear here as clean, launch-ready cards.</div>}
    </section><OperatorReference /></main>;
}
function AdvancedPanel({id, options, setOptions}: {id:string; options: AdvancedOptions; setOptions:(o:AdvancedOptions)=>void}) { const update=(k:keyof AdvancedOptions,v:string|boolean)=>setOptions({...options,[k]:v});
 if(id==='query') return <div className="advanced-grid"><label><input type="checkbox" checked={options.exactPhrase} onChange={e=>update('exactPhrase',e.target.checked)}/> Exact phrase <small>Wrap target in quotes. Example: "Jane Doe"</small></label><label>Required keywords<input value={options.requiredKeywords} onChange={e=>update('requiredKeywords',e.target.value)} placeholder="resume portfolio"/><small>Words that must appear.</small></label><label>Exclusions<input value={options.exclusions} onChange={e=>update('exclusions',e.target.value)} placeholder="jobs ads"/><small>Remove noisy terms.</small></label></div>;
 if(id==='sites') return <div className="advanced-grid"><label>Specific domains<input value={options.sites} onChange={e=>update('sites',e.target.value)} placeholder="example.com github.com"/><small>Limit searches using site: where supported.</small></label><label>Site exclusions<input value={options.excludedSites} onChange={e=>update('excludedSites',e.target.value)} placeholder="pinterest.com"/><small>Exclude distracting domains.</small></label></div>;
 return <div className="advanced-grid"><label>{id} setting<input value={(options as any)[id] || ''} onChange={e=>update(id as keyof AdvancedOptions,e.target.value)} placeholder="Optional targeting"/><small>Beginner-safe enhancement with engine-aware fallbacks.</small></label></div> }
function HelpCenter(){return <section className="help"><h2>Help Center</h2>{['What is OSINT? Public-source research using information intentionally available online.','Operators narrow results: quotes match phrases, site: limits domains, filetype: finds documents.','Engine differences matter; this workspace adapts syntax automatically.','Best practice: start broad, then add exclusions, sites, and dates.','Privacy: search responsibly, follow laws, and avoid intrusive behavior.'].map(t=><p key={t}>{t}</p>)}</section>}
function OperatorReference(){return <section className="operators"><h2>Search Operator Reference</h2><div className="table">{operatorReference.map(o=><div className="row" key={o.operator}><strong>{o.operator}</strong><span>{o.description}</span><code>{o.example}</code><span>{o.engines.join(', ')}</span><small>{o.limitations}</small></div>)}</div></section>}
createRoot(document.getElementById('root')!).render(<App />);
