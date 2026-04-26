import { describe, it, expect } from 'vitest';
import { fnvHash } from './hash';
describe('fnvHash', () => {
  it('相同文本相同哈希', () => expect(fnvHash('hello')).toBe(fnvHash('hello')));
  it('不同文本哈希不同', () => expect(fnvHash('hello')).not.toBe(fnvHash('world')));
  it('UTF-8 中文', () => expect(typeof fnvHash('你好世界')).toBe('string'));
  it('结果是 hex 字符串', () => expect(fnvHash('x')).toMatch(/^[0-9a-f]+$/));
});
