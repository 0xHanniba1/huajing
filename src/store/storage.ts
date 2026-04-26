// src/store/storage.ts
import { DEFAULT_SETTINGS, Settings, VocabEntry } from './types';

export async function getSettings(): Promise<Settings> {
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings) return { ...DEFAULT_SETTINGS };
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    engineConfigs: { ...DEFAULT_SETTINGS.engineConfigs, ...(settings.engineConfigs || {}) },
  };
}

export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const cur = await getSettings();
  const next = { ...cur, ...patch };
  await chrome.storage.local.set({ settings: next });
  return next;
}

export async function getVocab(): Promise<VocabEntry[]> {
  const { vocab } = await chrome.storage.local.get('vocab');
  return Array.isArray(vocab) ? vocab : [];
}

export async function addVocab(e: VocabEntry): Promise<void> {
  const cur = await getVocab();
  const without = cur.filter((x) => x.word !== e.word);
  await chrome.storage.local.set({ vocab: [...without, e] });
}

export async function removeVocab(word: string): Promise<void> {
  const cur = await getVocab();
  await chrome.storage.local.set({ vocab: cur.filter((x) => x.word !== word) });
}

type SettingsListener = (s: Settings) => void;
export function onSettingsChanged(fn: SettingsListener): () => void {
  const handler = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area !== 'local' || !changes.settings) return;
    getSettings().then(fn);
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener?.(handler);
}
