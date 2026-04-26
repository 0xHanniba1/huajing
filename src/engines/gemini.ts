import { Engine, EngineError } from './types';
import { buildBatchPrompt, parseBatchResponse } from './prompt';

export const geminiEngine: Engine = {
  id: 'gemini',
  async translateBatch(paragraphs, opts) {
    const prompt = buildBatchPrompt(paragraphs, opts.targetLang);
    const url = `${opts.config.baseURL}/models/${opts.config.model}:generateContent?key=${opts.config.apiKey}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
      signal: opts.signal,
    });
    if (!r.ok) throw new EngineError(`HTTP ${r.status}`, await r.text(), r.status);
    const j: any = await r.json();
    const text = (j?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
    return parseBatchResponse(text, paragraphs.length);
  },
  async ping(opts) {
    const url = `${opts.config.baseURL}/models/${opts.config.model}:generateContent?key=${opts.config.apiKey}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 1 },
      }),
      signal: opts.signal,
    });
    if (!r.ok) throw new EngineError(`HTTP ${r.status}`, await r.text(), r.status);
  },
};
