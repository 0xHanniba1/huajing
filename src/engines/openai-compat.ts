import { Engine, EngineError } from './types';
import { EngineId } from '../store/types';
import { buildBatchPrompt, parseBatchResponse } from './prompt';

export function makeOpenAICompatEngine(id: EngineId): Engine {
  return {
    id,
    async translateBatch(paragraphs, opts) {
      const prompt = buildBatchPrompt(paragraphs, opts.targetLang);
      const content = await completeChat(prompt, opts);
      return parseBatchResponse(content, paragraphs.length);
    },
    async complete(prompt, opts) {
      return completeChat(prompt, opts);
    },
    async ping(opts) {
      const r = await fetch(`${opts.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${opts.config.apiKey}`,
        },
        body: JSON.stringify({
          model: opts.config.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 16,
          stream: true,
        }),
        signal: opts.signal,
      });
      if (!r.ok) throw new EngineError(`HTTP ${r.status}`, await r.text(), r.status);
    },
  };
}

async function completeChat(prompt: string, opts: Parameters<Engine['translateBatch']>[1]): Promise<string> {
  const r = await fetch(`${opts.config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.config.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      stream: true,
    }),
    signal: opts.signal,
  });
  if (!r.ok) throw new EngineError(`HTTP ${r.status}`, await r.text(), r.status);
  return parseChatCompletionText(await r.text());
}

function parseChatCompletionText(raw: string): string {
  const body = raw.trim();
  if (!body) return '';

  if (!body.startsWith('data:')) {
    const j: any = JSON.parse(body);
    return j?.choices?.[0]?.message?.content ?? '';
  }

  let output = '';
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.startsWith('data:')) continue;
    const payload = line.slice('data:'.length).trim();
    if (!payload || payload === '[DONE]') continue;

    const j: any = JSON.parse(payload);
    output += j?.choices?.[0]?.delta?.content ?? j?.choices?.[0]?.message?.content ?? '';
  }
  return output;
}
