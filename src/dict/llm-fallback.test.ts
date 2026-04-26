import { describe, it, expect, vi } from 'vitest';
import { lookupViaLLM } from './llm-fallback';

describe('llm fallback', () => {
  it('解析合法 JSON 输出', async () => {
    const fakeEngine = {
      id: 'deepseek' as const,
      translateBatch: vi.fn(async (_texts: string[]) => [JSON.stringify({
        word: 'meritorious', ipa: '/ˌmer.ɪˈtɔː.ri.əs/', pos: 'adj.',
        defs: [{ pos: 'adj.', text: '有功的' }], examples: 'a meritorious deed', tags: ['GRE'],
      })]),
      ping: vi.fn(),
    };
    const e = await lookupViaLLM('meritorious', fakeEngine, { apiKey: 'k', baseURL: 'b', model: 'm' }, 'zh-CN');
    expect(e?.word).toBe('meritorious');
    expect(e?.defs[0].text).toBe('有功的');
  });
  it('引擎抛错时返回 null', async () => {
    const fakeEngine = {
      id: 'deepseek' as const,
      translateBatch: vi.fn(async () => { throw new Error('boom'); }),
      ping: vi.fn(),
    };
    const e = await lookupViaLLM('x', fakeEngine, { apiKey: 'k', baseURL: 'b', model: 'm' }, 'zh-CN');
    expect(e).toBeNull();
  });
});
