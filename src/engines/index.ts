import { Engine } from './types';
import { EngineId } from '../store/types';
import { makeOpenAICompatEngine } from './openai-compat';
import { anthropicEngine } from './anthropic';
import { geminiEngine } from './gemini';

const REGISTRY: Record<EngineId, Engine> = {
  deepseek: makeOpenAICompatEngine('deepseek'),
  openai:   makeOpenAICompatEngine('openai'),
  anthropic: anthropicEngine,
  gemini:    geminiEngine,
};

export function getEngine(id: EngineId): Engine {
  return REGISTRY[id];
}

export * from './types';
