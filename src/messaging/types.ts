import { Settings, EngineId, TargetLang, VocabEntry } from '../store/types';
import { DictEntry } from '../dict/types';

export type Msg =
  | { type: 'translate-batch'; texts: string[]; targetLang: TargetLang }
  | { type: 'lookup-word'; word: string; targetLang: TargetLang }
  | { type: 'test-connection'; engineId: EngineId }
  | { type: 'add-vocab'; entry: VocabEntry }
  | { type: 'remove-vocab'; word: string }
  | { type: 'open-options' }
  | { type: 'settings-changed'; settings: Settings };

export type MsgResult = {
  'translate-batch': { translations: string[] };
  'lookup-word': { entry: DictEntry | null };
  'test-connection': { ok: boolean; error?: string };
  'add-vocab': { ok: true };
  'remove-vocab': { ok: true };
  'open-options': { ok: true };
  'settings-changed': void;
};
