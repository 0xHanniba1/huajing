import { EngineId, EngineConfig, TargetLang } from '../store/types';

export type TranslateOpts = {
  targetLang: TargetLang;
  config: EngineConfig;
  signal?: AbortSignal;
};

export interface Engine {
  readonly id: EngineId;
  /** 输入 N 段，按相同顺序返回 N 段译文。失败抛 EngineError。 */
  translateBatch(paragraphs: string[], opts: TranslateOpts): Promise<string[]>;
  /** 原始单轮补全文本，用于轻量结构化任务。 */
  complete?(prompt: string, opts: TranslateOpts): Promise<string>;
  /** 用最便宜的方式发一个 1-token 请求，验 key 与 baseURL。 */
  ping(opts: TranslateOpts): Promise<void>;
}

export class EngineError extends Error {
  constructor(message: string, public readonly cause?: unknown, public readonly status?: number) {
    super(message);
    this.name = 'EngineError';
  }
}
