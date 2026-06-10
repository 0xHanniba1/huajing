import { Engine, EngineError } from './types';
import { buildBatchPrompt, parseBatchResponse } from './prompt';

export const geminiEngine: Engine = {
  id: 'gemini',
  async translateBatch(paragraphs, opts) {
    const prompt = buildBatchPrompt(paragraphs, opts.targetLang);
    const text = await completeGemini(prompt, opts);
    return parseBatchResponse(text, paragraphs.length);
  },
  async complete(prompt, opts) {
    return completeGemini(prompt, opts);
  },
  async ping(opts) {
    const url = geminiGenerateUrl(opts.config.baseURL, opts.config.model, opts.config.apiKey);
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

function geminiGenerateUrl(baseURL: string, model: string, apiKey: string): string {
  return `${baseURL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

async function completeGemini(prompt: string, opts: Parameters<Engine['translateBatch']>[1]): Promise<string> {
  const url = geminiGenerateUrl(opts.config.baseURL, opts.config.model, opts.config.apiKey);
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
  return (j?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
}
