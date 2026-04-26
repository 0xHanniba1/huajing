import { TargetLang } from '../store/types';

const LANG_NAME: Record<TargetLang, string> = {
  'zh-CN': '简体中文', 'zh-TW': '繁體中文', 'ja': '日本語', 'en': 'English',
};

export function buildBatchPrompt(paragraphs: string[], target: TargetLang): string {
  const body = paragraphs.map((p, i) => `⟦${i + 1}⟧${p}⟦/${i + 1}⟧`).join('\n');
  return `你是一位精确的翻译。把下面用 ⟦n⟧…⟦/n⟧ 包裹的段落各自译为${LANG_NAME[target]}，保持原始顺序，不要解释，只输出 ⟦n⟧译文⟦/n⟧ 的拼接结果。\n\n${body}`;
}

const SLOT_RE = /⟦(\d+)⟧([\s\S]*?)⟦\/\1⟧/g;

export function parseBatchResponse(raw: string, expected: number): string[] {
  const out: string[] = new Array(expected).fill('');
  for (const m of raw.matchAll(SLOT_RE)) {
    const idx = Number(m[1]) - 1;
    if (idx >= 0 && idx < expected) out[idx] = m[2].trim();
  }
  return out;
}
