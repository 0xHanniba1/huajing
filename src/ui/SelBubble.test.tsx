import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SelBubble } from './SelBubble';

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  root?.unmount();
  root = null;
  container?.remove();
  container = null;
});

describe('SelBubble', () => {
  it('renders icon buttons for word lookup, translation, speech, and close', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(
        <SelBubble
          x={0}
          y={0}
          kind="word"
          onTranslate={vi.fn(async () => '译文结果')}
          onLookup={vi.fn(async () => ({
            word: 'renaissance',
            ipa: '/ˈrenəsɑːns/',
            defs: [{ pos: 'n.', text: '复兴；重生' }],
          }))}
          onSpeak={vi.fn()}
          onClose={vi.fn()}
        />
      );
    });

    const buttons = [...container.querySelectorAll('.hj-bubble button')];
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(['查词', '翻译', '朗读', '关闭']);
    expect(container.querySelector('.hj-ico-search')).toBeTruthy();
    expect(container.querySelector('.hj-ico-translate')).toBeTruthy();
    expect(container.querySelector('.hj-ico-speaker')).toBeTruthy();
    expect(container.querySelector('.hj-ico-close')).toBeTruthy();
  });

  it('renders the translation result after clicking translate', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(
        <SelBubble
          x={0}
          y={0}
          onTranslate={vi.fn(async () => '译文结果')}
          onSpeak={vi.fn()}
        />
      );
    });

    await act(async () => {
      container!.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('译文结果');
    expect(container.textContent).not.toContain('复制');
  });

  it('renders dictionary details after clicking lookup for a single word', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(
        <SelBubble
          x={0}
          y={0}
          kind="word"
          onTranslate={vi.fn(async () => '译文结果')}
          onLookup={vi.fn(async () => ({
            word: 'philosophy',
            ipa: '/fəˈlɑːsəfi/',
            defs: [{ pos: 'n.', text: '哲学；人生观' }],
          }))}
          onSpeak={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain('查词');
    expect(container.textContent).not.toContain('复制');

    await act(async () => {
      container!.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('/fəˈlɑːsəfi/');
    expect(container.textContent).toContain('哲学；人生观');
    const wordHead = container.querySelector('.hj-wc-head')!;
    expect(wordHead.querySelector('.hj-wc-word')?.textContent).toBe('philosophy');
    expect(wordHead.querySelector('.hj-wc-ipa')?.textContent).toBe('/fəˈlɑːsəfi/');
  });

  it('adds a looked-up word to vocab from the dictionary card', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const onAddVocab = vi.fn(async () => {});

    await act(async () => {
      root!.render(
        <SelBubble
          x={0}
          y={0}
          kind="word"
          onTranslate={vi.fn(async () => '译文结果')}
          onLookup={vi.fn(async () => ({
            word: 'disrupt',
            ipa: "/dIs'rupt/",
            defs: [{ pos: 'v.', text: '扰乱；使中断' }],
          }))}
          onSpeak={vi.fn()}
          onAddVocab={onAddVocab}
        />
      );
    });

    await act(async () => {
      container!.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const addButton = [...container!.querySelectorAll('button')]
      .find((button) => button.textContent === '加入生词本');
    expect(addButton).toBeTruthy();

    await act(async () => {
      addButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onAddVocab).toHaveBeenCalledWith({
      word: 'disrupt',
      ipa: "/dIs'rupt/",
      defs: [{ pos: 'v.', text: '扰乱；使中断' }],
    });
    expect(container.textContent).toContain('已加入');
  });

  it('uses the v2 bubble and word card classes from the design file', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(
        <SelBubble
          x={0}
          y={0}
          kind="word"
          onTranslate={vi.fn(async () => '译文结果')}
          onLookup={vi.fn(async () => ({
            word: 'renaissance',
            ipa: '/ˈrenəsɑːns/',
            defs: [{ pos: 'n.', text: '复兴；重生' }],
          }))}
          onSpeak={vi.fn()}
          onAddVocab={vi.fn()}
        />
      );
    });

    expect(container.querySelector('.hj-bubble')).toBeTruthy();

    await act(async () => {
      container!.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('.hj-word-card')).toBeTruthy();
    expect(container.querySelector('.hj-wc-def')).toBeTruthy();
    expect(container.querySelector('.hj-wc-add')).toBeTruthy();
  });
});
