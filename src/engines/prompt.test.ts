import { describe, it, expect } from 'vitest';
import { buildBatchPrompt, parseBatchResponse } from './prompt';

describe('batch prompt', () => {
  it('包裹每段并保持顺序', () => {
    const p = buildBatchPrompt(['hello', 'world'], 'zh-CN');
    expect(p).toContain('⟦1⟧hello⟦/1⟧');
    expect(p).toContain('⟦2⟧world⟦/2⟧');
    expect(p).toContain('简体中文');
  });
  it('parseBatchResponse 切回 N 段', () => {
    const r = parseBatchResponse('⟦1⟧你好⟦/1⟧⟦2⟧世界⟦/2⟧', 2);
    expect(r).toEqual(['你好', '世界']);
  });
  it('容忍多余空白与换行', () => {
    const r = parseBatchResponse('  ⟦1⟧你好⟦/1⟧\n\n⟦2⟧ 世界  ⟦/2⟧\n', 2);
    expect(r).toEqual(['你好', '世界']);
  });
  it('段数不足时用 "" 补齐', () => {
    const r = parseBatchResponse('⟦1⟧你好⟦/1⟧', 3);
    expect(r).toEqual(['你好', '', '']);
  });
  it('支持 zh-TW / ja / en', () => {
    expect(buildBatchPrompt(['x'], 'zh-TW')).toContain('繁體中文');
    expect(buildBatchPrompt(['x'], 'ja')).toContain('日本語');
    expect(buildBatchPrompt(['x'], 'en')).toContain('English');
  });
});
