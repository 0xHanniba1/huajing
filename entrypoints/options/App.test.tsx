import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const { getVocabMock, removeVocabMock, addVocabMock } = vi.hoisted(() => ({
  getVocabMock: vi.fn(),
  removeVocabMock: vi.fn(),
  addVocabMock: vi.fn(),
}));

vi.mock('../../src/store/storage', () => ({
  getVocab: getVocabMock,
  removeVocab: removeVocabMock,
  addVocab: addVocabMock,
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  root?.unmount();
  root = null;
  container?.remove();
  container = null;
  vi.clearAllMocks();
});

describe('options App', () => {
  it('uses the v2 wordbook layout from the design file', async () => {
    getVocabMock.mockResolvedValue([
      { word: 'renaissance', addedAt: 200, status: 'learning', context: 'quiet renaissance', sourceURL: 'https://example.com/a' },
      { word: 'augment', addedAt: 100, status: 'mastered', context: 'gently augments it', sourceURL: 'https://example.com/b' },
    ]);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    expect(container.querySelector('.hj-wb')).toBeTruthy();
    expect(container.querySelector('.hj-wb-head')).toBeTruthy();
    expect(container.querySelector('.hj-wb-toolbar')).toBeTruthy();
    expect(container.querySelector('.hj-wb-search')).toBeTruthy();
    expect(container.querySelectorAll('.hj-wb-tab')).toHaveLength(3);
    expect(container.querySelector('.hj-wb-rowhead')).toBeTruthy();
    expect(container.querySelectorAll('.hj-wb-row').length).toBeGreaterThanOrEqual(3);
    expect(container.textContent).toContain('生词本');
    expect(container.textContent).toContain('2 个词');
    expect(container.textContent).toContain('已掌握 1');
  });

  it('renders dictionary pronunciation and definitions in the wordbook rows', async () => {
    getVocabMock.mockResolvedValue([
      {
        word: 'disrupt',
        addedAt: new Date('2026-04-26T08:00:00Z').getTime(),
        status: 'new',
        ipa: "/dIs'rupt/",
        defs: [{ pos: 'v.', text: '扰乱；使中断；使混乱' }],
        context: 'screamed disrupt or die',
        sourceURL: 'https://x.com/example/status/1',
      },
    ]);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    const firstWord = container.querySelector('.hj-wb-row:not(.hj-wb-rowhead) .c-word')!;
    const firstDef = container.querySelector('.hj-wb-row:not(.hj-wb-rowhead) .c-def')!;

    expect(firstWord.querySelector('.w')?.textContent).toBe('disrupt');
    expect(firstWord.querySelector('.ipa')?.textContent).toBe("/dIs'rupt/");
    expect(firstDef.textContent).toContain('扰乱；使中断；使混乱');
    expect(firstDef.querySelector('.tg')?.textContent).toBe('v.');
    expect(container.textContent).toContain('x.com');
  });
});
