import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiEngine } from './gemini';

const cfg = { apiKey: 'AIza-x', baseURL: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-flash' };
beforeEach(() => vi.restoreAllMocks());

describe('gemini engine', () => {
  it('POST :generateContent, key 在 query', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: '⟦1⟧你好⟦/1⟧' }] } }],
    }), { status: 200 }));
    const out = await geminiEngine.translateBatch(['hello'], { targetLang: 'zh-CN', config: cfg });
    expect(out).toEqual(['你好']);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIza-x');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.contents[0].parts[0].text).toContain('⟦1⟧hello⟦/1⟧');
  });
  it('ping 发 maxOutputTokens=1', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'x' }] } }],
    }), { status: 200 }));
    await geminiEngine.ping({ targetLang: 'zh-CN', config: cfg });
    const body = JSON.parse((fetchSpy.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.generationConfig.maxOutputTokens).toBe(1);
  });
});
