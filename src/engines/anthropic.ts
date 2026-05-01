import { Engine, EngineError } from './types';
import { buildBatchPrompt, parseBatchResponse } from './prompt';

export const anthropicEngine: Engine = {
  id: 'anthropic',
  async translateBatch(paragraphs, opts) {
    const prompt = buildBatchPrompt(paragraphs, opts.targetLang);
    const text = await completeAnthropic(prompt, opts);
    return parseBatchResponse(text, paragraphs.length);
  },
  async complete(prompt, opts) {
    return completeAnthropic(prompt, opts);
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

async function completeAnthropic(prompt: string, opts: Parameters<Engine['translateBatch']>[1]): Promise<string> {
  const r = await fetch(`${opts.config.baseURL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: opts.config.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: opts.signal,
  });
  if (!r.ok) throw new EngineError(`HTTP ${r.status}`, await r.text(), r.status);
  const j: any = await r.json();
  return (j?.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
}
