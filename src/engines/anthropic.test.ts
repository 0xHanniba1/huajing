import { describe, it, expect, vi, beforeEach } from 'vitest';
import { anthropicEngine } from './anthropic';

const cfg = { apiKey: 'sk-ant-x', baseURL: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-5' };

beforeEach(() => vi.restoreAllMocks());

describe('anthropic engine', () => {
  it('POST /messages, header x-api-key + anthropic-version', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      content: [{ type: 'text', text: '⟦1⟧你好⟦/1⟧' }],
    }), { status: 200 }));
    const out = await anthropicEngine.translateBatch(['hello'], { targetLang: 'zh-CN', config: cfg });
    expect(out).toEqual(['你好']);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers['x-api-key']).toBe('sk-ant-x');
    expect(headers['anthropic-version']).toBe('2023-06-01');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe('claude-sonnet-4-5');
    expect(body.max_tokens).toBeGreaterThan(100);
  });
  it('ping 发 max_tokens=1', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      content: [{ type: 'text', text: 'ok' }],
    }), { status: 200 }));
    await anthropicEngine.ping({ targetLang: 'zh-CN', config: cfg });
    const body = JSON.parse((fetchSpy.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.max_tokens).toBe(1);
  });
});
