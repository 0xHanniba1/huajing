import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../engines', () => ({
  getEngine: () => ({
    translateBatch: vi.fn(async (texts: string[]) => texts.map((t) => `[${t}]`)),
  }),
}));

import { handleTranslateBatch, _resetCache } from './translate-router';

beforeEach(async () => {
  _resetCache();
  await chrome.storage.local.set({ settings: { engine: 'deepseek', targetLang: 'zh-CN', engineConfigs: { deepseek: { apiKey: 'k', baseURL: 'b', model: 'm' } } } });
});

describe('handleTranslateBatch', () => {
  it('翻译并按顺序返回', async () => {
    const r = await handleTranslateBatch({ texts: ['a', 'b'], targetLang: 'zh-CN' });
    expect(r.translations).toEqual(['[a]', '[b]']);
  });
  it('命中缓存第二次直接返', async () => {
    await handleTranslateBatch({ texts: ['a'], targetLang: 'zh-CN' });
    const r = await handleTranslateBatch({ texts: ['a'], targetLang: 'zh-CN' });
    expect(r.translations).toEqual(['[a]']);
  });
});
