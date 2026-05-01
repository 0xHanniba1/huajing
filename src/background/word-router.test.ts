import { beforeEach, describe, expect, it, vi } from 'vitest';

const { completeMock } = vi.hoisted(() => ({
  completeMock: vi.fn(async () => JSON.stringify({
    word: 'philosophy',
    ipa: '/fəˈlɑːsəfi/',
    defs: [{ pos: 'n.', text: '哲学；人生观' }],
    tags: ['common'],
  })),
}));

vi.mock('../engines', () => ({
  getEngine: () => ({ complete: completeMock }),
}));

import { handleLookupWord } from './word-router';

beforeEach(async () => {
  completeMock.mockClear();
  await chrome.storage.local.set({
    settings: {
      engine: 'deepseek',
      targetLang: 'zh-CN',
      engineConfigs: {
        deepseek: { apiKey: 'k', baseURL: 'https://api.example.com/v1', model: 'm' },
      },
    },
  });
});

describe('handleLookupWord', () => {
  it('asks the current model for a dictionary entry and parses JSON', async () => {
    const r = await handleLookupWord({ word: 'Philosophy', targetLang: 'zh-CN' });

    expect(r.entry).toMatchObject({
      word: 'philosophy',
      ipa: '/fəˈlɑːsəfi/',
      defs: [{ pos: 'n.', text: '哲学；人生观' }],
    });
    expect(completeMock).toHaveBeenCalledWith(
      expect.stringContaining('"Philosophy"'),
      expect.objectContaining({ targetLang: 'zh-CN' }),
    );
  });

  it('reuses cached entries for the same word and target language', async () => {
    const first = await handleLookupWord({ word: 'Adventure', targetLang: 'zh-CN' });
    const second = await handleLookupWord({ word: 'adventure', targetLang: 'zh-CN' });

    expect(first.entry?.defs[0]?.text).toBe('哲学；人生观');
    expect(second.entry?.defs[0]?.text).toBe('哲学；人生观');
    expect(completeMock).toHaveBeenCalledTimes(1);
  });
});
