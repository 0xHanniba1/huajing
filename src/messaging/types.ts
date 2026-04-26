import { Settings, EngineId, VocabEntry } from '../store/types';
import { DictEntry } from '../dict/types';

export type Msg =
  | { type: 'translate-batch'; texts: string[]; targetLang: string }
  | { type: 'lookup-word'; word: string }
  | { type: 'test-connection'; engineId: EngineId }
  | { type: 'add-vocab'; entry: VocabEntry }
  | { type: 'remove-vocab'; word: string }
  | { type: 'open-options' }
  | { type: 'settings-changed'; settings: Settings }
  | { type: 'cmd-toggle' }
  | { type: 'cmd-cycle-mode' };

export type MsgResult = {
  'translate-batch': { translations: string[] };
  'lookup-word': { entry: DictEntry | null };
  'test-connection': { ok: boolean; error?: string };
  'add-vocab': { ok: true };
  'remove-vocab': { ok: true };
  'open-options': { ok: true };
  'settings-changed': void;
  'cmd-toggle': void;
  'cmd-cycle-mode': void;
};
