export type EngineId = 'deepseek' | 'openai' | 'anthropic' | 'gemini';
export type Mode = 'hover';
export type TargetLang = 'zh-CN' | 'zh-TW' | 'ja' | 'en';
export type Theme = 'light' | 'dark' | 'auto';
export type Divider = 'solid' | 'dashed' | 'dotted' | 'bracket' | 'none';

export type EngineConfig = { apiKey: string; baseURL: string; model: string };
export type VocabDefinition = { pos?: string; text: string };

export type Settings = {
  enabled: boolean;
  mode: Mode;
  targetLang: TargetLang;
  engine: EngineId;
  engineConfigs: Record<EngineId, EngineConfig>;
  theme: Theme;
  autoSites: string[];
  transColor: string;
  transFontSize: number;
  divider: Divider;
};

export type VocabEntry = {
  word: string;
  addedAt: number;
  status: 'new' | 'learning' | 'mastered';
  ipa?: string;
  defs?: VocabDefinition[];
  context?: string;
  sourceURL?: string;
};

export const ENGINE_PRESETS: Record<EngineId, { baseURL: string; defaultModel: string; models: string[] }> = {
  deepseek:  { baseURL: 'https://api.deepseek.com/v1',                       defaultModel: 'deepseek-chat',     models: ['deepseek-chat', 'deepseek-reasoner'] },
  openai:    { baseURL: 'https://api.openai.com/v1',                         defaultModel: 'gpt-4o-mini',        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  anthropic: { baseURL: 'https://api.anthropic.com/v1',                      defaultModel: 'claude-sonnet-4-5',  models: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5'] },
  gemini:    { baseURL: 'https://generativelanguage.googleapis.com/v1beta',  defaultModel: 'gemini-2.5-flash',   models: ['gemini-2.5-pro', 'gemini-2.5-flash'] },
};

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  mode: 'hover',
  targetLang: 'zh-CN',
  engine: 'deepseek',
  engineConfigs: Object.fromEntries(
    (Object.keys(ENGINE_PRESETS) as EngineId[]).map((id) => [id, { apiKey: '', baseURL: ENGINE_PRESETS[id].baseURL, model: ENGINE_PRESETS[id].defaultModel }])
  ) as Record<EngineId, EngineConfig>,
  theme: 'auto',
  autoSites: [],
  transColor: '#2b6cb0',
  transFontSize: 15,
  divider: 'solid',
};
