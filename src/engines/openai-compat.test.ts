import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeOpenAICompatEngine } from './openai-compat';

const cfg = { apiKey: 'sk-x', baseURL: 'https://api.example.com/v1', model: 'm' };

beforeEach(() => { vi.restoreAllMocks(); });

describe('openai-compat engine', () => {
  it('translateBatch 拼正确请求并解析 choices[0].message.content', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '⟦1⟧你好⟦/1⟧⟦2⟧世界⟦/2⟧' } }],
    }), { status: 200 }));
    const eng = makeOpenAICompatEngine('openai');
    const out = await eng.translateBatch(['hello', 'world'], { targetLang: 'zh-CN', config: cfg });
    expect(out).toEqual(['你好', '世界']);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://api.example.com/v1/chat/completions');
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer sk-x' });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe('m');
    expect(body.messages[0].content).toContain('⟦1⟧hello⟦/1⟧');
  });
  it('鉴权失败抛 EngineError(status=401)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('unauth', { status: 401 }));
    const eng = makeOpenAICompatEngine('deepseek');
    await expect(eng.translateBatch(['x'], { targetLang: 'zh-CN', config: cfg }))
      .rejects.toMatchObject({ name: 'EngineError', status: 401 });
  });
  it('ping 发最小请求', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: 'ok' } }],
    }), { status: 200 }));
    const eng = makeOpenAICompatEngine('openai');
    await eng.ping({ targetLang: 'zh-CN', config: cfg });
    const body = JSON.parse((fetchSpy.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.max_tokens).toBe(1);
  });
});
