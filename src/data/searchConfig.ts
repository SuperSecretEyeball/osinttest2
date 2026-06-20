export type Engine = { id: string; name: string; url: string; supports: string[]; unsupported: string[]; transform?: (query: string) => string };
export const engines: Engine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', supports: ['site','filetype','intitle','inurl','quotes','minus'], unsupported: [] },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={query}', supports: ['site','filetype','intitle','inurl','quotes','minus'], unsupported: [] },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}', supports: ['site','filetype','quotes','minus'], unsupported: ['intitle','inurl'] },
  { id: 'brave', name: 'Brave Search', url: 'https://search.brave.com/search?q={query}', supports: ['site','filetype','quotes','minus'], unsupported: ['intitle'] },
  { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text={query}', supports: ['site','quotes','minus'], unsupported: ['filetype','intitle'] },
  { id: 'startpage', name: 'Startpage', url: 'https://www.startpage.com/sp/search?query={query}', supports: ['site','quotes','minus'], unsupported: ['filetype','intitle','inurl'] },
];
export const categories = [
  { id: 'general', name: 'General Web', icon: '🌐', template: '{target}' },
  { id: 'social', name: 'Social Media', icon: '💬', template: '{target} profile social' },
  { id: 'images', name: 'Images', icon: '🖼️', template: '{target} images photos' },
  { id: 'documents', name: 'Documents', icon: '📄', template: '{target} (filetype:pdf OR filetype:doc OR filetype:xls)' },
  { id: 'news', name: 'News', icon: '📰', template: '{target} news press media' },
  { id: 'forums', name: 'Forums', icon: '🧵', template: '{target} forum discussion community' },
  { id: 'developer', name: 'Developer Platforms', icon: '⌘', template: '{target} github stackoverflow code' },
  { id: 'everything', name: 'Everything', icon: '✨', template: '{target} profile OR document OR image OR news OR forum' },
];
export const platformTemplates = [
  { id:'x', name:'X (Twitter)', domain:'x.com', terms:'twitter OR x.com' }, { id:'reddit', name:'Reddit', domain:'reddit.com', terms:'reddit' },
  { id:'youtube', name:'YouTube', domain:'youtube.com', terms:'youtube channel' }, { id:'tiktok', name:'TikTok', domain:'tiktok.com', terms:'tiktok' },
  { id:'instagram', name:'Instagram', domain:'instagram.com', terms:'instagram' }, { id:'facebook', name:'Facebook', domain:'facebook.com', terms:'facebook' },
  { id:'linkedin', name:'LinkedIn', domain:'linkedin.com', terms:'linkedin' }, { id:'github', name:'GitHub', domain:'github.com', terms:'github repository' },
  { id:'twitch', name:'Twitch', domain:'twitch.tv', terms:'twitch' }, { id:'medium', name:'Medium', domain:'medium.com', terms:'medium article' },
  { id:'pinterest', name:'Pinterest', domain:'pinterest.com', terms:'pinterest image' },
];
export const presets = [
  { id:'username', name:'Username Search', categories:['social','forums','developer'], platforms:['reddit','github','x','instagram'], engines:['google','bing','duckduckgo'], exampleTarget:'janedoe' },
  { id:'profile', name:'Public Profile Discovery', categories:['social','general'], platforms:['linkedin','facebook','instagram','x'], engines:['google','bing','brave'], exampleTarget:'Jane Doe' },
  { id:'footprint', name:'General Footprint Search', categories:['everything'], platforms:[], engines:['google','bing','duckduckgo','brave'], exampleTarget:'Jane Doe' },
  { id:'company', name:'Company Research', categories:['general','news','documents'], platforms:['linkedin','github'], engines:['google','bing','startpage'], exampleTarget:'Acme Corp' },
  { id:'developer', name:'Developer Footprint', categories:['developer','forums'], platforms:['github','reddit'], engines:['google','duckduckgo','brave'], exampleTarget:'janedoe' },
  { id:'news', name:'News & Mentions', categories:['news'], platforms:[], engines:['google','bing','yandex'], exampleTarget:'Acme Corp' },
  { id:'domain', name:'Domain Research', categories:['general','documents'], platforms:[], engines:['google','bing','duckduckgo'], exampleTarget:'example.com' },
  { id:'docs', name:'Document Discovery', categories:['documents'], platforms:[], engines:['google','bing'], exampleTarget:'Acme Corp' },
  { id:'images', name:'Image Discovery', categories:['images'], platforms:['instagram','pinterest'], engines:['google','bing','yandex'], exampleTarget:'Jane Doe' },
  { id:'all', name:'Comprehensive Search', categories:['everything','social','documents','news','forums','developer'], platforms:['x','reddit','youtube','tiktok','instagram','facebook','linkedin','github','twitch','medium','pinterest'], engines:['google','bing','duckduckgo','brave','yandex','startpage'], exampleTarget:'Jane Doe' },
];
export const operatorReference = [
  { operator:'"phrase"', description:'Search an exact phrase.', example:'"Jane Doe"', engines:['Google','Bing','DuckDuckGo','Brave','Yandex','Startpage'], limitations:'Can miss variants and nicknames.' },
  { operator:'site:', description:'Restrict results to a domain.', example:'site:linkedin.com "Jane Doe"', engines:['Google','Bing','DuckDuckGo','Brave','Yandex','Startpage'], limitations:'Coverage varies by engine.' },
  { operator:'filetype:', description:'Find public files.', example:'filetype:pdf "Acme Corp"', engines:['Google','Bing','DuckDuckGo','Brave'], limitations:'Not reliable on all engines.' },
  { operator:'intitle:', description:'Require terms in page title.', example:'intitle:profile janedoe', engines:['Google','Bing'], limitations:'Removed for engines without support.' },
  { operator:'-', description:'Exclude terms or sites.', example:'janedoe -jobs -site:pinterest.com', engines:['Google','Bing','DuckDuckGo','Brave','Yandex','Startpage'], limitations:'May be interpreted differently.' },
];
