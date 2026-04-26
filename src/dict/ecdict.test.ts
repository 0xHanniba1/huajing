import { describe, it, expect, beforeEach } from 'vitest';
import { putEntry, lookup, _resetDB } from './ecdict';

beforeEach(async () => { await _resetDB(); });

describe('ecdict IndexedDB', () => {
  it('put + lookup 命中', async () => {
    await putEntry({ word: 'augment', ipa: '/ˈɔːɡmənt/', defs: [{ pos: 'v.', text: '增强' }], tags: ['四级'] });
    const e = await lookup('augment');
    expect(e?.defs[0].text).toBe('增强');
    expect(e?.tags).toEqual(['四级']);
  });
  it('lookup 未命中返回 null', async () => {
    expect(await lookup('nonsense')).toBeNull();
  });
  it('lookup 大小写不敏感', async () => {
    await putEntry({ word: 'hello', ipa: '', defs: [{ text: '你好' }] });
    expect((await lookup('Hello'))?.defs[0].text).toBe('你好');
  });
});
