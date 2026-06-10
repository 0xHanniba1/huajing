import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, Settings } from '../../src/store/types';
import { send } from '../../src/messaging/rpc';
import { ApiConfigSection } from './ApiConfigSection';

vi.mock('../../src/messaging/rpc', () => ({
  send: vi.fn(async () => ({ ok: true })),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  root?.unmount();
  root = null;
  container?.remove();
  container = null;
  vi.unstubAllGlobals();
});

describe('ApiConfigSection', () => {
  it('allows typing a custom model while keeping preset suggestions', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const patch = vi.fn();
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      engineConfigs: { ...DEFAULT_SETTINGS.engineConfigs },
    };

    await act(async () => {
      root!.render(<ApiConfigSection settings={settings} patch={patch} />);
    });

    const input = container.querySelector<HTMLInputElement>('input[list="hj-model-options-deepseek"]');
    expect(input).toBeTruthy();
    expect(input!.value).toBe('deepseek-chat');

    const suggestions = [...container.querySelectorAll<HTMLOptionElement>('#hj-model-options-deepseek option')]
      .map((option) => option.value);
    expect(suggestions).toEqual(['deepseek-chat', 'deepseek-reasoner']);

    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(input, 'deepseek-v3.1');
      input!.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(patch).toHaveBeenCalledWith({
      engineConfigs: {
        ...settings.engineConfigs,
        deepseek: { ...settings.engineConfigs.deepseek, model: 'deepseek-v3.1' },
      },
    });
  });

  it('loads available models and lets the user select one', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const patch = vi.fn();
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      engineConfigs: {
        ...DEFAULT_SETTINGS.engineConfigs,
        deepseek: {
          ...DEFAULT_SETTINGS.engineConfigs.deepseek,
          apiKey: 'sk-test',
        },
      },
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      data: [
        { id: 'deepseek-chat' },
        { id: 'deepseek-reasoner' },
        { id: 'deepseek-v3.1' },
      ],
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await act(async () => {
      root!.render(<ApiConfigSection settings={settings} patch={patch} />);
    });

    const queryButton = [...container.querySelectorAll('button')]
      .find((button) => button.textContent === '查询模型');
    expect(queryButton).toBeTruthy();

    await act(async () => {
      queryButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fetchMock).toHaveBeenCalledWith('https://api.deepseek.com/v1/models', {
      headers: { Authorization: 'Bearer sk-test' },
    });

    const loadedSelect = container.querySelector<HTMLSelectElement>('select[aria-label="查询到的可用模型"]');
    expect(loadedSelect).toBeTruthy();
    expect([...loadedSelect!.options].map((option) => option.value)).toEqual([
      '',
      'deepseek-chat',
      'deepseek-reasoner',
      'deepseek-v3.1',
    ]);

    await act(async () => {
      loadedSelect!.value = 'deepseek-v3.1';
      loadedSelect!.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(patch).toHaveBeenCalledWith({
      engineConfigs: {
        ...settings.engineConfigs,
        deepseek: { ...settings.engineConfigs.deepseek, model: 'deepseek-v3.1' },
      },
    });
  });

  it('marks the connection test as failed when send rejects', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      engineConfigs: {
        ...DEFAULT_SETTINGS.engineConfigs,
        deepseek: { ...DEFAULT_SETTINGS.engineConfigs.deepseek, apiKey: 'sk-test' },
      },
    };
    vi.mocked(send).mockRejectedValueOnce(new Error('扩展已重新加载，请刷新当前页面'));

    await act(async () => {
      root!.render(<ApiConfigSection settings={settings} patch={vi.fn()} />);
    });

    const testButton = [...container.querySelectorAll('button')]
      .find((button) => button.textContent === '测试连接');
    expect(testButton).toBeTruthy();

    await act(async () => {
      testButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('.hj-status-tag')!.textContent).toContain('连接失败');
    expect((testButton as HTMLButtonElement).disabled).toBe(false);
  });

  it('uses the v2 API configuration structure from the design file', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      engineConfigs: { ...DEFAULT_SETTINGS.engineConfigs },
    };

    await act(async () => {
      root!.render(<ApiConfigSection settings={settings} patch={vi.fn()} />);
    });

    expect(container.querySelector('.hj-collapse-head')).toBeTruthy();
    expect(container.querySelector('.hj-status-tag')).toBeTruthy();
    expect(container.querySelector('.hj-api-body')).toBeTruthy();
    expect(container.querySelectorAll('.hj-field').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('.hj-input-with-btn')).toBeTruthy();
    expect(container.querySelector('.hj-link-btn')).toBeTruthy();
    expect(container.querySelector('.hj-api-actions')).toBeTruthy();
  });
});
