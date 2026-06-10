import { getEngine } from '../engines';
import { fnvHash } from '../dom/hash';
import { getSettings } from '../store/storage';
import { TargetLang } from '../store/types';

const cache = new Map<string, string>();

export function _resetCache() { cache.clear(); }

function key(text: string, lang: TargetLang) { return `${lang}:${fnvHash(text)}`; }

export async function handleTranslateBatch(args: { texts: string[]; targetLang: TargetLang }): Promise<{ translations: string[] }> {
  const { texts, targetLang } = args;
  const settings = await getSettings();
  const engine = getEngine(settings.engine);
  const out: string[] = new Array(texts.length).fill('');
  const todo: { idx: number; text: string }[] = [];
  texts.forEach((t, i) => {
    const k = key(t, targetLang);
    const c = cache.get(k);
    if (c != null) out[i] = c;
    else todo.push({ idx: i, text: t });
  });
  if (todo.length) {
    const trans = await engine.translateBatch(todo.map((x) => x.text), {
      targetLang,
      config: settings.engineConfigs[settings.engine],
    });
    todo.forEach(({ idx, text }, j) => {
      out[idx] = trans[j] || '';
      // 空槽位多半是解析失败，缓存会让后续重试永远拿到空串
      if (out[idx]) cache.set(key(text, targetLang), out[idx]);
    });
  }
  return { translations: out };
}
