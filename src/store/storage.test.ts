// src/store/storage.test.ts
import { describe, it, expect } from 'vitest';
import { getSettings, patchSettings, getVocab, addVocab, removeVocab, onSettingsChanged } from './storage';
import { DEFAULT_SETTINGS } from './types';

describe('settings storage', () => {
  it('未写入时返回默认设置', async () => {
    const s = await getSettings();
    expect(s).toEqual(DEFAULT_SETTINGS);
  });
  it('已写入时合并默认值（向前兼容新增字段）', async () => {
    await chrome.storage.local.set({ settings: { mode: 'replace' } });
    const s = await getSettings();
    expect(s.mode).toBe(DEFAULT_SETTINGS.mode);
    expect(s.targetLang).toBe(DEFAULT_SETTINGS.targetLang);  // 新增字段回退默认
  });
  it('把旧的双语对照模式迁移为划词模式', async () => {
    await chrome.storage.local.set({ settings: { mode: 'bilingual' } });
    const s = await getSettings();
    expect(s.mode).toBe('hover');
  });
  it('patchSettings 只写改动字段', async () => {
    await patchSettings({ mode: 'hover' });
    const s = await getSettings();
    expect(s.mode).toBe('hover');
    expect(s.engine).toBe(DEFAULT_SETTINGS.engine);
  });
  it('onSettingsChanged 回调触发', async () => {
    let fired: any = null;
    onSettingsChanged((s) => (fired = s));
    await patchSettings({ mode: 'hover' });
    expect(fired?.mode).toBe('hover');
  });
});

describe('vocab storage', () => {
  it('addVocab 去重（同 word 取后写入时间）', async () => {
    await addVocab({ word: 'augment', addedAt: 100, status: 'new' });
    await addVocab({ word: 'augment', addedAt: 200, status: 'learning' });
    const v = await getVocab();
    expect(v).toHaveLength(1);
    expect(v[0].status).toBe('learning');
    expect(v[0].addedAt).toBe(200);
  });
  it('removeVocab 删除指定 word', async () => {
    await addVocab({ word: 'a', addedAt: 1, status: 'new' });
    await addVocab({ word: 'b', addedAt: 2, status: 'new' });
    await removeVocab('a');
    const v = await getVocab();
    expect(v.map((x) => x.word)).toEqual(['b']);
  });
});
