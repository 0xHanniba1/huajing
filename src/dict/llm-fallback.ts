import { DictEntry } from './types';
import { Engine } from '../engines/types';
import { EngineConfig, TargetLang } from '../store/types';

export async function lookupViaLLM(
  word: string, engine: Engine, config: EngineConfig, targetLang: TargetLang
): Promise<DictEntry | null> {
  const prompt = `给出英文单词 "${word}" 的词典解释，目标语言：${targetLang}。
严格输出 JSON（不要任何解释、不要代码块包裹），形如：
{"word":"...","ipa":"/.../","pos":"v./n./...","defs":[{"pos":"v.","text":"释义1"}],"examples":"一个例句","tags":["四级"]}`;
  try {
    const [out] = await engine.translateBatch([prompt], { targetLang, config });
    const json = out.match(/\{[\s\S]*\}/)?.[0] ?? out;
    const obj = JSON.parse(json);
    return {
      word: obj.word || word,
      ipa: obj.ipa || '',
      pos: obj.pos,
      defs: Array.isArray(obj.defs) ? obj.defs : [],
      examples: obj.examples,
      tags: obj.tags,
    };
  } catch {
    return null;
  }
}
