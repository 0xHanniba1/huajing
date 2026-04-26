import { Engine, EngineError } from './types';
import { buildBatchPrompt, parseBatchResponse } from './prompt';

export const anthropicEngine: Engine = {
  id: 'anthropic',
  async translateBatch(paragraphs, opts) {
    const prompt = buildBatchPrompt(paragraphs, opts.targetLang);
    const r = await fetch(`${opts.config.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': opts.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: opts.config.model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: opts.signal,
    });
    if (!r.ok) throw new EngineError(`HTTP ${r.status}`, await r.text(), r.status);
    const j: any = await r.json();
    const text = (j?.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
    return parseBatchResponse(text, paragraphs.length);
  },
  async ping(opts) {
    const r = await fetch(`${opts.config.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': opts.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: opts.config.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
      signal: opts.signal,
    });
    if (!r.ok) throw new EngineError(`HTTP ${r.status}`, await r.text(), r.status);
  },
};
