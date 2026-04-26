import { ensureLoaded, lookup, putEntry } from '../dict/ecdict';
import { lookupViaLLM } from '../dict/llm-fallback';
import { getEngine } from '../engines';
import { getSettings } from '../store/storage';
import { DictEntry } from '../dict/types';

let bootP: Promise<void> | null = null;
function ensureBoot() { return bootP ??= ensureLoaded((p) => chrome.runtime.getURL(p)); }

export async function handleLookupWord(args: { word: string }): Promise<{ entry: DictEntry | null }> {
  await ensureBoot();
  const local = await lookup(args.word);
  if (local) return { entry: local };
  const s = await getSettings();
  const cfg = s.engineConfigs[s.engine];
  if (!cfg.apiKey) return { entry: null };
  const llm = await lookupViaLLM(args.word, getEngine(s.engine), cfg, s.targetLang);
  if (llm) await putEntry(llm);
  return { entry: llm };
}
