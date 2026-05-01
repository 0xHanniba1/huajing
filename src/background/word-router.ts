import { getEngine } from '../engines';
import { DictEntry } from '../dict/types';
import { getSettings } from '../store/storage';
import { TargetLang } from '../store/types';

const WORD_LOOKUP_CACHE_KEY = 'wordLookupCache';
const MAX_CACHE_ENTRIES = 5000;
const CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

const LANG_NAME: Record<TargetLang, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  en: 'English',
};

export async function handleLookupWord(args: { word: string; targetLang: TargetLang }): Promise<{ entry: DictEntry | null }> {
  const word = args.word.trim();
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(word)) return { entry: null };
  const cached = await getCachedLookup(word, args.targetLang);
  if (cached) return { entry: cached };

  const settings = await getSettings();
  const cfg = settings.engineConfigs[settings.engine];
  if (!cfg.apiKey) return { entry: null };
  const engine = getEngine(settings.engine);
  if (!engine.complete) throw new Error('当前引擎不支持查词');

  const raw = await engine.complete(buildLookupPrompt(word, args.targetLang), {
    targetLang: args.targetLang,
    config: cfg,
  });
  const entry = parseLookupEntry(raw, word);
  if (entry) await setCachedLookup(word, args.targetLang, entry);
  return { entry };
}

function buildLookupPrompt(word: string, targetLang: TargetLang): string {
  return `给出英文单词 "${word}" 的词典信息，释义语言：${LANG_NAME[targetLang]}。
只输出 JSON，不要 Markdown，不要代码块。格式：
{"word":"lowercase","ipa":"/.../","defs":[{"pos":"n.","text":"释义"}],"tags":["常用"]}`;
}

function parseLookupEntry(raw: string, fallbackWord: string): DictEntry | null {
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
  try {
    const obj = JSON.parse(json);
    const defs = normalizeDefs(obj.defs);
    if (!defs.length) return null;
    return {
      word: String(obj.word || fallbackWord).trim(),
      ipa: String(obj.ipa || '').trim(),
      pos: typeof obj.pos === 'string' ? obj.pos : undefined,
      defs,
      examples: typeof obj.examples === 'string' ? obj.examples : undefined,
      tags: Array.isArray(obj.tags) ? obj.tags.map(String).filter(Boolean) : undefined,
    };
  } catch {
    return null;
  }
}

function normalizeDefs(defs: unknown): DictEntry['defs'] {
  if (!Array.isArray(defs)) return [];
  return defs
    .map((item) => {
      if (typeof item === 'string') return { text: item };
      if (!item || typeof item !== 'object') return null;
      const rec = item as { pos?: unknown; text?: unknown };
      const text = typeof rec.text === 'string' ? rec.text.trim() : '';
      if (!text) return null;
      return {
        pos: typeof rec.pos === 'string' ? rec.pos : undefined,
        text,
      };
    })
    .filter((item): item is { pos?: string; text: string } => item != null)
    .slice(0, 6);
}

type WordLookupCacheRecord = {
  entry: DictEntry;
  addedAt: number;
};

type WordLookupCache = Record<string, WordLookupCacheRecord>;

async function getCachedLookup(word: string, targetLang: TargetLang): Promise<DictEntry | null> {
  const cache = await readLookupCache();
  const item = cache[lookupCacheKey(word, targetLang)];
  if (!item || !isDictEntry(item.entry)) return null;
  if (Date.now() - item.addedAt > CACHE_TTL_MS) return null;
  return item.entry;
}

async function setCachedLookup(word: string, targetLang: TargetLang, entry: DictEntry): Promise<void> {
  const cache = await readLookupCache();
  cache[lookupCacheKey(word, targetLang)] = { entry, addedAt: Date.now() };
  await chrome.storage.local.set({ [WORD_LOOKUP_CACHE_KEY]: trimLookupCache(cache) });
}

async function readLookupCache(): Promise<WordLookupCache> {
  const data = await chrome.storage.local.get(WORD_LOOKUP_CACHE_KEY);
  const cache = data[WORD_LOOKUP_CACHE_KEY];
  if (!cache || typeof cache !== 'object' || Array.isArray(cache)) return {};
  return cache as WordLookupCache;
}

function trimLookupCache(cache: WordLookupCache): WordLookupCache {
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(cache)
      .filter(([, item]) => isDictEntry(item?.entry) && now - item.addedAt <= CACHE_TTL_MS)
      .sort((a, b) => b[1].addedAt - a[1].addedAt)
      .slice(0, MAX_CACHE_ENTRIES),
  );
}

function lookupCacheKey(word: string, targetLang: TargetLang): string {
  return `${targetLang}:${word.trim().toLowerCase()}`;
}

function isDictEntry(value: unknown): value is DictEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as DictEntry;
  return typeof entry.word === 'string'
    && typeof entry.ipa === 'string'
    && Array.isArray(entry.defs)
    && entry.defs.every((item) => item && typeof item.text === 'string');
}
