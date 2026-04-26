import { getEngine } from '../engines';
import { getSettings, addVocab, removeVocab } from '../store/storage';
import { EngineId, VocabEntry } from '../store/types';

export async function handleTestConnection(args: { engineId: EngineId }): Promise<{ ok: boolean; error?: string }> {
  const s = await getSettings();
  const cfg = s.engineConfigs[args.engineId];
  if (!cfg.apiKey) return { ok: false, error: '未填写 API Key' };
  try {
    await getEngine(args.engineId).ping({ targetLang: s.targetLang, config: cfg });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function handleAddVocab(args: { entry: VocabEntry }) {
  await addVocab(args.entry);
  return { ok: true as const };
}

export async function handleRemoveVocab(args: { word: string }) {
  await removeVocab(args.word);
  return { ok: true as const };
}

export async function handleOpenOptions() {
  await chrome.runtime.openOptionsPage();
  return { ok: true as const };
}
