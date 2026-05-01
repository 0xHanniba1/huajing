import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, Settings } from '../../src/store/types';
import { App } from './App';

const { patchMock, settingsRef } = vi.hoisted(() => ({
  patchMock: vi.fn(),
  settingsRef: { current: null as Settings | null },
}));

vi.mock('./useSettings', () => ({
  useSettings: () => ({ settings: settingsRef.current, patch: patchMock }),
}));

vi.mock('./ApiConfigSection', () => ({
  ApiConfigSection: () => null,
}));

vi.mock('../../src/store/storage', () => ({
  getVocab: vi.fn(async () => []),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  settingsRef.current = {
    ...DEFAULT_SETTINGS,
    engineConfigs: { ...DEFAULT_SETTINGS.engineConfigs },
  };
  (chrome as any).tabs = {
    query: vi.fn(async () => [{ id: 7, url: 'https://x.com/post/1' }]),
    sendMessage: vi.fn(async () => undefined),
  };
});

afterEach(() => {
  root?.unmount();
  root = null;
  container?.remove();
  container = null;
  vi.clearAllMocks();
});

describe('popup App', () => {
  it('shows the v1.0.1 release version in the header', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    expect(container.querySelector('.hj-pop-name .v')?.textContent).toBe('v1.0.1');
  });

  it('does not render keyboard shortcut hints', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    expect(container.textContent).not.toContain('快捷键');
    expect(container.textContent).not.toContain('Option');
    expect(container.textContent).not.toContain('Alt');
  });

  it('does not render mode switching controls', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    expect(container.textContent).not.toContain('翻译模式');
    expect(container.textContent).not.toContain('双语对照');
    expect(container.textContent).not.toContain('划词翻译');
    expect(container.textContent).not.toContain('原文替换');
    expect(container.querySelectorAll('.hj-mode-card')).toHaveLength(0);
  });

  it('does not render per-site auto translation controls', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    expect(container.textContent).not.toContain('本站自动翻译');
    expect(container.textContent).not.toContain('x.com');
    expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
  });

  it('places the dark mode toggle in the header next to the power switch', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    const head = container.querySelector('.hj-pop-head')!;
    expect(head.textContent).toContain('深色模式');
    expect(container.textContent).not.toContain('行为');

    const themeToggle = head.querySelector<HTMLButtonElement>('.hj-tiny-toggle')!;
    expect(themeToggle).toBeTruthy();

    await act(async () => {
      themeToggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(patchMock).toHaveBeenCalledWith({ theme: 'dark' });
  });

  it('uses the v2 popup structure from the design file', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(<App />);
    });

    expect(container.querySelector('.hj-pop-head-right')).toBeTruthy();
    expect(container.querySelector('.hj-row-l')).toBeTruthy();
    expect(container.querySelector('.hj-row-r')).toBeTruthy();
    expect(container.querySelector('.hj-color-swatch')).toBeTruthy();
    expect(container.querySelector('.hj-slider')).toBeTruthy();
    expect(container.querySelector('.hj-foot-link')).toBeTruthy();
  });
});
