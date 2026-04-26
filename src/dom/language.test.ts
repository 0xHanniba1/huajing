import { describe, it, expect } from 'vitest';
import { isMostlyCJK, shouldTranslate } from './language';
describe('language detect', () => {
  it('纯英文 isMostlyCJK=false', () => expect(isMostlyCJK('Hello world how are you')).toBe(false));
  it('纯中文 isMostlyCJK=true', () => expect(isMostlyCJK('你好世界今天天气真好')).toBe(true));
  it('混排 30% 阈值', () => {
    expect(isMostlyCJK('hello 你好')).toBe(false);            // 2/7
    expect(isMostlyCJK('你好世界 hi')).toBe(true);            // 4/7
  });
  it('shouldTranslate=外文文本+长度足', () => {
    expect(shouldTranslate('Hello world this is a sentence.')).toBe(true);
    expect(shouldTranslate('你好世界')).toBe(false);
    expect(shouldTranslate('hi')).toBe(false);
    expect(shouldTranslate('')).toBe(false);
    expect(shouldTranslate('123 456')).toBe(false);
  });
});
